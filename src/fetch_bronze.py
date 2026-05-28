import requests
import json
import os
import time
from datetime import datetime

VENUES = ["ICSE", "ECSA", "MSR", "ICSME"]
YEARS  = range(2008, 2024)
OUT    = "data/bronze"

os.makedirs(OUT, exist_ok=True)

def fetch_all_papers(venue, retries=3):
    all_papers = []
    page_size  = 1000
    start      = 0

    while True:
        params = {
            "q":      f"venue:{venue}:",
            "format": "json",
            "h":      page_size,
            "f":      start,
        }

        for attempt in range(retries):
            res = requests.get("https://dblp.org/search/publ/api", params=params)

            if res.status_code != 200:
                print(f"    HTTP {res.status_code} — retrying ({attempt+1}/{retries})")
                time.sleep(2 ** attempt)
                continue

            if not res.text.strip():
                print(f"    Empty response — retrying ({attempt+1}/{retries})")
                time.sleep(2 ** attempt)
                continue

            try:
                data  = res.json()
                hits  = data["result"]["hits"].get("hit", [])
                total = int(data["result"]["hits"].get("@total", 0))

                for hit in hits:
                    info    = hit["info"]
                    authors = info.get("authors", {}).get("author", [])
                    if isinstance(authors, dict):
                        authors = [authors]
                    raw_names = [
                        a["text"] if isinstance(a, dict) else a
                        for a in authors
                    ]
                    all_papers.append({
                        "title":   info.get("title"),
                        "year":    info.get("year"),
                        "authors": raw_names,
                        "url":     info.get("url"),
                    })

                print(f"    fetched {start + len(hits)} / {total}")
                break

            except Exception as e:
                print(f"    Parse error: {e} — retrying ({attempt+1}/{retries})")
                time.sleep(2 ** attempt)
        else:
            print(f"    Failed after {retries} attempts, stopping pagination")
            break

        start += page_size
        if start >= total:
            break

        time.sleep(1)

    return all_papers


def fetch_venue(venue):
    cache_path = f"{OUT}/{venue}.json"

    if os.path.exists(cache_path):
        print(f"  {venue} — already cached, skipping")
        return

    print(f"  {venue} — fetching all papers...")
    all_papers = fetch_all_papers(venue)

    # group by year client-side
    by_year = {}
    for paper in all_papers:
        year = paper.get("year")
        if year and int(year) in YEARS:
            by_year.setdefault(year, []).append(paper)

    cache = {
        "venue":      venue,
        "fetched_at": datetime.now().isoformat(),
        "years":      by_year,
    }

    with open(cache_path, "w") as f:
        json.dump(cache, f, indent=2)

    total = sum(len(v) for v in by_year.values())
    print(f"  saved {total} papers across {len(by_year)} years → {cache_path}")


if __name__ == "__main__":
    for venue in VENUES:
        print(f"\nFetching {venue}...")
        fetch_venue(venue)