# syntax=docker/dockerfile:1
FROM python:3.12-slim-bookworm

ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY src ./src

RUN pip install --no-cache-dir -U pip \
    && pip install --no-cache-dir .

RUN python -m kuriftu_agent.agent download-files

CMD ["python", "-m", "kuriftu_agent.agent", "start"]
