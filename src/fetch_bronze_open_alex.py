import json
import time
from pathlib import Path

import requests

BRONZE_DBLP_DIR = Path("data/bronze/dblp")
OUTPUT_DIR = Path("data/bronze/openalex_topics")
OPENALEX_URL = "https://api.openalex.org/works"
HEADERS = {"User-Agent": "gender-diversity-study/1.0 (your@email.com)"}
BATCH_SIZE = 50
BATCH_SLEEP = 1.0  # seconds between OpenAlex requests
FILE_SLEEP = 0.5  # seconds between venue files


def normalise_doi(doi: str) -> str:
    """Strip the https://doi.org/ prefix and lowercase for comparison."""
    return doi.replace("https://doi.org/", "").lower()


def load_papers(venue_file: Path) -> tuple[str, list[dict]]:
    """Return (venue_name, flat list of paper dicts) from a venue JSON file."""
    with venue_file.open(encoding="utf-8") as f:
        data = json.load(f)

    venue = data.get("venue", venue_file.stem)
    papers = []

    for year_str, paper_list in data.get("years", {}).items():
        for paper in paper_list:
            doi = (paper.get("doi") or "").strip()
            if not doi:
                continue
            papers.append(
                {
                    "doi": doi,
                    "dblp_title": paper.get("title", ""),
                    "year": int(year_str),
                }
            )

    return venue, papers


def load_existing(out_path: Path) -> dict[str, dict]:
    """Load already-fetched papers from a venue output file, keyed by DOI."""
    if not out_path.exists():
        return {}
    with out_path.open(encoding="utf-8") as f:
        data = json.load(f)
    return data.get("papers", {})


def save_venue(out_path: Path, venue: str, papers: dict[str, dict]) -> None:
    """Write the venue output file."""
    with out_path.open("w", encoding="utf-8") as f:
        json.dump({"venue": venue, "papers": papers}, f, indent=2, ensure_ascii=False)


def fetch_batch(dois: list[str]) -> dict[str, dict]:
    """
    Query OpenAlex for up to BATCH_SIZE DOIs in one request.

    Returns a dict keyed by normalised DOI (no scheme prefix, lowercase).
    Returns an empty dict on any request error (caller continues to next batch).
    """
    filter_value = "|".join(dois)
    params = {
        "filter": f"doi:{filter_value}",
        "select": "id,doi,title,publication_year,primary_topic,topics",
        "per_page": BATCH_SIZE,
    }
    try:
        resp = requests.get(OPENALEX_URL, params=params, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        results = resp.json().get("results", [])
    except Exception as exc:
        print(f"  [ERROR] Batch request failed: {exc}")
        return {}

    matched: dict[str, dict] = {}
    for work in results:
        raw_doi = (work.get("doi") or "").strip()
        if raw_doi:
            matched[normalise_doi(raw_doi)] = work
    return matched


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    venue_files = sorted(BRONZE_DBLP_DIR.glob("*.json"))
    if not venue_files:
        print(f"No venue files found in {BRONZE_DBLP_DIR}")
        return

    total = 0
    total_matched = 0
    total_unmatched = 0
    total_skipped = 0

    for venue_file in venue_files:
        print(f"\nProcessing {venue_file.name} ...")
        venue, papers = load_papers(venue_file)

        out_path = OUTPUT_DIR / f"{venue}.json"
        existing: dict[str, dict] = load_existing(out_path)

        pending = []
        for paper in papers:
            total += 1
            if paper["doi"] in existing:
                total_skipped += 1
            else:
                pending.append(paper)

        print(
            f"  {len(papers)} papers — {len(existing)} already done, "
            f"{len(pending)} to fetch"
        )

        for batch_start in range(0, len(pending), BATCH_SIZE):
            batch = pending[batch_start : batch_start + BATCH_SIZE]
            dois = [p["doi"] for p in batch]
            batch_num = batch_start // BATCH_SIZE + 1
            print(f"  Batch {batch_num}: fetching {len(dois)} DOIs ...")

            oa_results = fetch_batch(dois)

            for paper_meta in batch:
                oa_data = oa_results.get(normalise_doi(paper_meta["doi"]))
                existing[paper_meta["doi"]] = {
                    "dblp_title": paper_meta["dblp_title"],
                    "year": paper_meta["year"],
                    "openalex": oa_data,
                }
                if oa_data:
                    total_matched += 1
                else:
                    total_unmatched += 1

            # Write after every batch so progress is saved on interruption
            save_venue(out_path, venue, existing)
            time.sleep(BATCH_SLEEP)

        time.sleep(FILE_SLEEP)

    print("\n=== Summary ===")
    print(f"  Total papers:          {total}")
    print(f"  Already skipped:       {total_skipped}")
    print(f"  Matched by OpenAlex:   {total_matched}")
    print(f"  Unmatched:             {total_unmatched}")
    print(f"  Output directory:      {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
