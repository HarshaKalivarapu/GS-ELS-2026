#!/usr/bin/env python3

import json
import pathlib
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/"

EVENTS = [
    {
        "id": "dotcom",
        "label": "2000 Dot-com Bust",
        "start": "2000-03-24",
        "end": "2004-12-31",
        "description": "Tech-heavy equities sold off sharply after the internet bubble burst, then recovered gradually over the following years.",
        "featured": False,
    },
    {
        "id": "gfc",
        "label": "2008 Financial Crisis",
        "start": "2007-10-09",
        "end": "2010-12-31",
        "description": "A deep global financial crisis led to a severe equity drawdown followed by a multi-stage recovery.",
        "featured": True,
    },
    {
        "id": "covid",
        "label": "2020 COVID Crash",
        "start": "2020-02-19",
        "end": "2020-12-31",
        "description": "Pandemic shock triggered one of the fastest crashes in modern history, followed by a sharp rebound.",
        "featured": False,
    },
    {
        "id": "rate-hike",
        "label": "2022 Rate Hike Bear Market",
        "start": "2022-01-03",
        "end": "2023-12-29",
        "description": "Higher inflation and aggressive rate hikes pressured risk assets before markets stabilized.",
        "featured": False,
    },
]


def to_epoch_seconds(date_str: str, plus_days: int = 0) -> int:
    dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    if plus_days:
        dt = dt + timedelta(days=plus_days)
    return int(dt.timestamp())


def fetch_spy_history(start: str, end: str) -> dict:
    period1 = to_epoch_seconds(start)
    period2 = to_epoch_seconds(end, plus_days=1)

    url = (
        f"{BASE_URL}{urllib.parse.quote('SPY')}"
        f"?period1={period1}&period2={period2}"
        "&interval=1d&includePrePost=false&events=history"
    )

    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        },
    )

    with urllib.request.urlopen(req, timeout=30) as resp:
        body = resp.read().decode("utf-8")
        return json.loads(body)


def build_event(event: dict) -> dict:
    raw = fetch_spy_history(event["start"], event["end"])
    result = raw.get("chart", {}).get("result", [])
    if not result:
        raise RuntimeError(f"No chart result for SPY / {event['id']}")

    node = result[0]
    timestamps = node.get("timestamp", [])
    closes = node.get("indicators", {}).get("quote", [{}])[0].get("close", [])

    points = []
    start_price = None
    min_index = None

    for ts, close in zip(timestamps, closes):
        if close is None:
            continue

        price = float(close)
        if start_price is None:
            start_price = price

        market_index = 100.0 * (price / start_price)
        if min_index is None or market_index < min_index:
            min_index = market_index

        date_str = datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")
        points.append({
            "date": date_str,
            "marketIndex": round(market_index, 4),
        })

    if not points:
        raise RuntimeError(f"No usable close data for SPY / {event['id']}")

    end_index = points[-1]["marketIndex"]
    market_drawdown_pct = (min_index / 100.0) - 1.0
    end_change_pct = (end_index / 100.0) - 1.0

    return {
        "id": event["id"],
        "label": event["label"],
        "start": event["start"],
        "end": event["end"],
        "description": event["description"],
        "featured": event["featured"],
        "marketDrawdownPct": round(market_drawdown_pct, 6),
        "marketEndChangePct": round(end_change_pct, 6),
        "series": points,
    }


def main() -> None:
    out = {
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "events": [],
    }

    for event in EVENTS:
        print(f"Fetching SPY for {event['id']} ({event['start']} -> {event['end']})")
        built = build_event(event)
        out["events"].append(built)
        time.sleep(0.8)

    root = pathlib.Path(__file__).resolve().parents[1]
    out_path = root / "src" / "main" / "resources" / "stress-history.json"
    out_path.write_text(json.dumps(out, indent=2), encoding="utf-8")

    print(f"\nWrote: {out_path}")


if __name__ == "__main__":
    main()