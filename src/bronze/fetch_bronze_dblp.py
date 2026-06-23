import requests
import json
import os
import time
from datetime import datetime

VENUES = ["ICSE", "ECSA", "MSR", "ICSME"]
YEARS = range(2008, 2024)
OUT = "data/bronze/dblp"

# Pre-2014 the conference was called ICSM; DBLP tags those papers venue=ICSM.
# A different "ICSM" (Smart Multimedia, conf/icsm2/) also exists, so filter by
# URL to keep only software-maintenance papers (conf/icsm/).
ICSME_PRE2014_VENUE = "ICSM"
ICSME_PRE2014_URL_PREFIX = "conf/icsm/"
ICSME_PRE2014_URL_EXCLUDE = "conf/icsm2/"
ICSME_PRE2014_CUTOFF = 2014

os.makedirs(OUT, exist_ok=True)


def fetch_year(venue, year, url_filter=None, retries=3):
    papers = []
    page_size = 1000
    start = 0
    total = None

    while True:
        params = {
            "q": f"venue:{venue}: year:{year}",
            "format": "json",
            "h": page_size,
            "f": start,
        }

        for attempt in range(retries):
            try:
                res = requests.get("https://dblp.org/search/publ/api", params=params)

                if res.status_code != 200:
                    print(
                        f"    HTTP {res.status_code} — retrying ({attempt + 1}/{retries})"
                    )
                    time.sleep(30 * (attempt + 1))
                    continue

                if not res.text.strip():
                    print(f"    Empty response — retrying ({attempt + 1}/{retries})")
                    time.sleep(30 * (attempt + 1))
                    continue

                data = res.json()
                hits = data["result"]["hits"].get("hit", [])
                total = int(data["result"]["hits"].get("@total", 0))

                for hit in hits:
                    info = hit["info"]
                    url = info.get("url", "") or ""
                    if url_filter and not url_filter(url):
                        continue
                    authors = info.get("authors", {}).get("author", [])
                    if isinstance(authors, dict):
                        authors = [authors]
                    raw_names = [
                        a["text"] if isinstance(a, dict) else a for a in authors
                    ]
                    papers.append(
                        {
                            "title": info.get("title"),
                            "year": info.get("year"),
                            "authors": raw_names,
                            "doi": info.get("doi"),  # ← added
                            "ee": info.get("ee"),  # ← added as fallback
                            "url": url,
                        }
                    )

                break

            except Exception as e:
                print(f"    Error: {e} — retrying ({attempt + 1}/{retries})")
                time.sleep(30 * (attempt + 1))
        else:
            print(f"    Failed after {retries} attempts, skipping year {year}")
            break

        start += page_size
        if total is None or start >= total:
            break

        time.sleep(1)

    return papers


def load_cache(cache_path, venue):
    if os.path.exists(cache_path):
        with open(cache_path, "r") as f:
            return json.load(f)
    return {"venue": venue, "fetched_at": None, "years": {}}


def save_cache(cache_path, cache):
    cache["fetched_at"] = datetime.now().isoformat()
    with open(cache_path, "w") as f:
        json.dump(cache, f, indent=2)


def fetch_venue(venue):
    cache_path = f"{OUT}/{venue}.json"
    cache = load_cache(cache_path, venue)
    existing_years = set(cache["years"].keys())
    # Years we've confirmed have no data (e.g. ECSA joint conferences) — tracked
    # separately so we don't re-fetch them, but excluded from "years" so downstream
    # treats them as genuine gaps rather than zeros.
    checked_empty = set(cache.get("checked_empty_years", []))

    # For ICSME, pre-2014 years must be fetched under the old "ICSM" label.
    def icsm_url_filter(url):
        return ICSME_PRE2014_URL_PREFIX in url and ICSME_PRE2014_URL_EXCLUDE not in url

    added = 0
    for year in YEARS:
        year_str = str(year)
        if year_str in existing_years or year_str in checked_empty:
            print(f"  {venue} {year} — already cached, skipping")
            continue

        if venue == "ICSME" and year < ICSME_PRE2014_CUTOFF:
            query_venue = ICSME_PRE2014_VENUE
            url_filter = icsm_url_filter
        else:
            query_venue = venue
            url_filter = None

        print(f"  {venue} {year} — fetching...")
        papers = fetch_year(query_venue, year, url_filter=url_filter)
        print(f"    got {len(papers)} papers")

        if papers:
            cache["years"][year_str] = papers
            added += len(papers)
        else:
            checked_empty.add(year_str)
            cache["checked_empty_years"] = sorted(checked_empty)

        save_cache(cache_path, cache)
        time.sleep(5)

    total = sum(len(v) for v in cache["years"].values())
    print(
        f"  {venue} — done. {added} new papers added, {total} total across {len(cache['years'])} years → {cache_path}"
    )


if __name__ == "__main__":
    for venue in VENUES:
        print(f"\nFetching {venue}...")
        fetch_venue(venue)
