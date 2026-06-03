import json
import os
import time

import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GENDERIZE_API_KEY")
NAMES_PATH = "data/bronze/genderize/names.json"
OUT = "data/bronze/genderize/gender_lookup.json"
BATCH_SIZE = 10


def load_cache():
    if os.path.exists(OUT):
        with open(OUT, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_cache(cache):
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)


def fetch_batch(names, api_key):
    params = [("name[]", name) for name in names]
    params.append(("apikey", api_key))
    res = requests.get("https://api.genderize.io", params=params)
    res.raise_for_status()
    return res.json()


if __name__ == "__main__":
    with open(NAMES_PATH, encoding="utf-8") as f:
        all_names = json.load(f)

    cache = load_cache()
    remaining = [n for n in all_names if n not in cache]
    print(f"{len(cache)} already cached, {len(remaining)} remaining")

    batches = [remaining[i : i + BATCH_SIZE] for i in range(0, len(remaining), BATCH_SIZE)]

    for i, batch in enumerate(batches):
        results = fetch_batch(batch, API_KEY)
        for r in results:
            cache[r["name"]] = {
                "gender": r.get("gender"),
                "probability": r.get("probability"),
                "count": r.get("count"),
            }
        save_cache(cache)
        print(f"  batch {i + 1}/{len(batches)} — {len(cache)} cached")
        time.sleep(0.5)

    print(f"done — {len(cache)} names in {OUT}")
