#!/usr/bin/env python3
from __future__ import annotations

from typing import Tuple

from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import random
import time
import threading

from enhanced_env import MarketEnvironment
from enhanced_agent import DQNAgent
from human_baseline import HumanBaseline
from enhanced_reward_system import EnhancedRewardSystem

app = Flask(__name__)
CORS(app)

# ─── Globals ──────────────────────────────────────────────────────────────────
env = MarketEnvironment(num_products=5, num_customer_segments=3, time_periods=24, competitors=2)
state_size = env.state_size
action_size = env.action_size

agent    = DQNAgent(state_size, action_size)
baseline = HumanBaseline(env, strategy='combined')
reward_system = EnhancedRewardSystem(baseline_comparison=True)

training_status = {
    "isTraining": False,
    "currentEpisode": 0,
    "totalEpisodes": 0,
    "startTime": None,
    "endTime": None
}

training_results = {
    "finalReward": 0,
    "avgLast10": 0,
    "improvementOverBaseline": 0,
    "rewardHistory": [],
    "baselineHistory": []
}

training_thread = None


# ─── Core Training Loop ───────────────────────────────────────────────────────
def train_agent(episodes=10, use_baseline=True, baseline_strategy='combined'):
    global training_status, training_results, env, agent, baseline, reward_system

    training_status.update({
        "isTraining": True,
        "currentEpisode": 0,
        "totalEpisodes": episodes,
        "startTime": time.time(),
        "endTime": None
    })

    reward_system.reset()
    agent.epsilon = 1.0
    agent.update_target_model()

    if baseline.strategy != baseline_strategy:
        baseline.strategy = baseline_strategy

    # Pre-generate seeds for reproducibility
    seeds = [random.randrange(2**32) for _ in range(episodes)]

    for ep in range(episodes):
        seed = seeds[ep]
        training_status["currentEpisode"] = ep + 1

        # 1) Baseline run
        if use_baseline:
            random.seed(seed)
            np.random.seed(seed)
            b_reward, _, _ = baseline.run_episode()
            reward_system.add_baseline_reward(b_reward)

        # 2) Agent run
        random.seed(seed)
        np.random.seed(seed)
        state = env.reset()
        total_reward = 0
        done = False

        while not done:
            action = agent.act(state)
            next_state, reward, done, _ = env.step(action)
            agent.remember(state, action, reward, next_state, done)
            state = next_state
            total_reward += reward
            if len(agent.memory) > agent.batch_size:
                agent.replay()

        reward_system.add_agent_reward(total_reward)

        if (ep + 1) % 10 == 0:
            agent.update_target_model()

        # Update results
        hist = reward_system.agent_rewards
        training_results.update({
            "rewardHistory": hist,
            "baselineHistory": reward_system.baseline_rewards,
            "finalReward": hist[-1],
            "avgLast10": float(np.mean(hist[-10:])),
            "improvementOverBaseline": reward_system.get_improvement_percentage()
        })

        time.sleep(0.1)

    training_status.update({
        "isTraining": False,
        "endTime": time.time()
    })
    agent.save("smart_pricing_model.h5")


# ─── Helpers for static endpoints ─────────────────────────────────────────────
def _compute_price_demand(env):
    out = []
    for product in env.get_products():
        bp = product['base_price']
        pts = [bp * f for f in (0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3)]
        demand = [max(0, 100*(bp/p)**1.5) for p in pts]
        revenue = [p*d/100 for p,d in zip(pts,demand)]
        out.append((product, pts, demand, revenue))
    return out

def _compute_time_pricing():
    times = ['6 AM','8 AM','10 AM','12 PM','2 PM','4 PM','6 PM','8 PM','10 PM']
    mults = [0.85,0.9,0.95,1.0,1.05,1.1,1.15,1.1,1.0]
    return {"timeOfDay": times, "weekdays": ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], "priceMultipliers": mults}

def _compute_segment_data(env):
    segs = env.get_customer_segments()
    return [
        {
            "name": s['name'],
            "value": round(s['size']*100,1),
            "priceSensitivity": round(s['price_sensitivity'],2),
            "qualityPreference": round(s['quality_preference'],2)
        }
        for s in segs
    ]


# ─── API Endpoints ────────────────────────────────────────────────────────────
@app.route('/api/start_training', methods=['POST'])
def start_training():
    global training_thread
    data = request.json or {}
    episodes = int(data.get('episodes', 10))
    episodes = max(1, min(episodes, 1000))
    use_baseline = bool(data.get('useBaseline', True))
    baseline_strategy = data.get('baselineStrategy', 'combined')

    if training_thread and training_thread.is_alive():
        return jsonify({"success": False, "message": "Training already in progress"}), 400

    training_thread = threading.Thread(
        target=train_agent,
        args=(episodes, use_baseline, baseline_strategy),
        daemon=True
    )
    training_thread.start()
    return jsonify({"success": True, "message": f"Training started for {episodes} episodes"})


@app.route('/api/training_status', methods=['GET'])
def get_status():
    return jsonify(training_status)


@app.route('/api/training_results', methods=['GET'])
def get_results():
    return jsonify(training_results)


@app.route('/api/products', methods=['GET'])
def get_products():
    prods = env.get_products()
    for p in prods:
        bp, cp = p['base_price'], p['current_price']
        p['recommendation'] = (
            'Increase Price' if cp < bp*0.9 else
            'Decrease Price' if cp > bp*1.1 else
            'Maintain Price'
        )
    return jsonify(prods)


@app.route('/api/customer_segments', methods=['GET'])
def get_customer_segments():
    return jsonify(env.get_customer_segments())


@app.route('/api/generate_sample_data', methods=['POST'])
def generate_sample_data():
    global env
    env = MarketEnvironment(num_products=5, num_customer_segments=3, time_periods=24, competitors=2)
    return jsonify({"products": env.get_products()})


@app.route('/api/baseline_comparison', methods=['GET'])
def baseline_comp():
    return jsonify(reward_system.get_reward_history())


@app.route('/api/price_demand_data', methods=['GET'])
def price_demand_data():
    out = []
    for p, pts, dm, rv in _compute_price_demand(env):
        out.append({
            "product": p['name'],
            "pricePoints": [round(x,2) for x in pts],
            "demand": [round(x,2) for x in dm],
            "revenue": [round(x,2) for x in rv]
        })
    return jsonify(out)


@app.route('/api/time_pricing_data', methods=['GET'])
def time_pricing_data():
    return jsonify(_compute_time_pricing())


@app.route('/api/customer_segment_data', methods=['GET'])
def customer_segment_data():
    return jsonify(_compute_segment_data(env))


# ─── Kuriftu NEXORA: live service pricing + human confirm ─────────────────────


def _competitor_avg_for_product(product_id: int) -> float:
    return float(np.mean([env.competitor_prices[c][product_id] for c in range(env.competitors)]))


def _revenue_optimal_price(base_price: float) -> float:
    pts = [base_price * f for f in (0.75, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.22)]
    demand = [max(0.0, 100.0 * (base_price / max(p, 0.01)) ** 1.5) for p in pts]
    revenue = [p * d / 100.0 for p, d in zip(pts, demand)]
    i = int(np.argmax(revenue))
    return float(pts[i])


def _kuriftu_suggested_for_product(p: dict) -> Tuple[float, int, str, int]:
    """Returns (suggested_price, confidence 0-100, insight, demand_index 0-100)."""
    bp = float(p['base_price'])
    published = float(p['current_price'])
    comp_avg = _competitor_avg_for_product(p['id'])
    curve_best = _revenue_optimal_price(bp)
    suggested = 0.52 * curve_best + 0.48 * comp_avg
    lo, hi = bp * 0.84, bp * 1.26
    suggested = float(np.clip(suggested, lo, hi))
    suggested = round(suggested, 2)

    delta_pct = ((suggested - published) / published * 100.0) if published else 0.0
    if suggested > published * 1.02:
        direction = "lift"
        insight = (
            f"Demand–revenue curve peaks near ${suggested:.0f} (vs published ${published:.0f}). "
            f"Competitor blend is ${comp_avg:.0f}. Model recommends capturing willingness-to-pay with a "
            f"{abs(delta_pct):.1f}% increase."
        )
    elif suggested < published * 0.98:
        direction = "cut"
        insight = (
            f"Elasticity vs. comp set (${comp_avg:.0f} avg) favors softening to ${suggested:.0f} "
            f"({abs(delta_pct):.1f}% below published) to protect conversion and ancillary spend."
        )
    else:
        direction = "hold"
        insight = (
            f"Published ${published:.0f} sits near the revenue optimum (${curve_best:.0f}) "
            f"and competitive band (${comp_avg:.0f}). Minor tuning only."
        )

    spread = abs(suggested - curve_best) / max(bp, 1.0)
    confidence = int(np.clip(92 - spread * 40 - (0 if direction != "hold" else 4), 68, 96))

    # Simple demand index from segment + time factor (operational signal for UI)
    seg_strength = float(np.mean([s['size'] for s in env.customer_segments]))
    t_idx = env.current_time % len(env.time_factors)
    demand_index = int(np.clip(35 + seg_strength * 80 + env.time_factors[t_idx] * 28, 12, 98))

    return suggested, confidence, insight, demand_index


def _demand_level_from_index(idx: int) -> str:
    if idx >= 82:
        return "Surge"
    if idx >= 64:
        return "High"
    if idx >= 40:
        return "Medium"
    return "Low"


def _status_from_prices(base: float, published: float, suggested: float) -> str:
    if suggested < base * 0.97 and published > base * 1.02:
        return "Overpriced"
    if suggested > base * 1.04:
        return "Underpriced"
    return "Optimal"


@app.route('/api/kuriftu/health', methods=['GET'])
def kuriftu_health():
    return jsonify({"ok": True, "service": "kuriftu-pricing"})


@app.route('/api/kuriftu/service-pricing', methods=['GET'])
def kuriftu_service_pricing():
    rows = []
    for p in env.get_products():
        bp = float(p['base_price'])
        published = float(p['current_price'])
        suggested, confidence, insight, d_idx = _kuriftu_suggested_for_product(p)
        change_vs_base = ((published - bp) / bp * 100.0) if bp else 0.0
        rows.append({
            "id": str(p['id']),
            "numericId": int(p['id']),
            "name": p['name'],
            "category": p['category'],
            "basePrice": round(bp, 2),
            "publishedPrice": round(published, 2),
            "aiSuggestedPrice": suggested,
            "demandLevel": _demand_level_from_index(d_idx),
            "demandIndex": d_idx,
            "changePctPublishedVsBase": round(change_vs_base, 2),
            "changePctSuggestedVsPublished": round(((suggested - published) / published * 100.0) if published else 0.0, 2),
            "status": _status_from_prices(bp, published, suggested),
            "insight": insight,
            "confidence": confidence,
            "competitorAvg": round(_competitor_avg_for_product(p['id']), 2),
        })
    return jsonify({"services": rows, "updatedAt": time.time()})


@app.route('/api/kuriftu/confirm-prices', methods=['POST'])
def kuriftu_confirm_prices():
    """Apply AI-suggested prices to published (guest-facing) rates."""
    data = request.json or {}
    ids = data.get('ids')
    apply_all = bool(data.get('applyAll', True))
    id_set = None
    if not apply_all and ids is not None:
        id_set = set(int(x) for x in ids)

    applied = []
    for p in env.get_products():
        pid = int(p['id'])
        if id_set is not None and pid not in id_set:
            continue
        suggested, _, _, _ = _kuriftu_suggested_for_product(p)
        old = float(p['current_price'])
        p['current_price'] = suggested
        applied.append({
            "id": pid,
            "name": p['name'],
            "previousPublished": round(old, 2),
            "newPublished": suggested,
        })

    return jsonify({
        "success": True,
        "applied": applied,
        "message": f"Updated {len(applied)} published rate(s) from AI suggestions.",
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
