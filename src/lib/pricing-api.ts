import type { KuriftuServicePricingRow } from "@/lib/data/types";

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_KURIFTU_API_URL?.replace(/\/$/, "");
  return base ?? "http://127.0.0.1:5000";
}

export async function fetchKuriftuServicePricing(): Promise<{
  services: KuriftuServicePricingRow[];
  updatedAt: number;
}> {
  const res = await fetch(`${apiBase()}/api/kuriftu/service-pricing`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Pricing API ${res.status}: ${res.statusText}`);
  }
  const data = (await res.json()) as { services: KuriftuServicePricingRow[]; updatedAt: number };
  return data;
}

export async function confirmKuriftuAiPrices(options?: { ids?: number[]; applyAll?: boolean }): Promise<{
  success: boolean;
  applied: { id: number; name: string; previousPublished: number; newPublished: number }[];
  message: string;
}> {
  const body =
    options?.ids && options.ids.length
      ? { applyAll: false, ids: options.ids }
      : { applyAll: options?.applyAll !== false, ids: options?.ids };

  const res = await fetch(`${apiBase()}/api/kuriftu/confirm-prices`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Confirm failed (${res.status})`);
  }
  return res.json() as Promise<{
    success: boolean;
    applied: { id: number; name: string; previousPublished: number; newPublished: number }[];
    message: string;
  }>;
}

export async function checkKuriftuPricingBackend(): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/api/kuriftu/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
