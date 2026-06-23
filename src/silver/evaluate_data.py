import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils import clean_name

VENUES = ["ICSE", "ECSA", "MSR", "ICSME"]
IN = "data/bronze"
OUT = "data/silver"
GENDER_LOOKUP_PATH = "data/bronze/genderize/gender_lookup.json"


def gender_map_names(venue):
    cache_path = f"{OUT}/authors/{venue}.json"
    bronze_path = f"{IN}/dblp/{venue}.json"

    with open(GENDER_LOOKUP_PATH, encoding="utf-8") as f:
        gender_lookup = json.load(f)

    with open(bronze_path, "r", encoding="utf-8") as f:
        bronze = json.load(f)

    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    else:
        data = {"venue": venue, "years": {}}

    existing_years = set(data["years"].keys())
    added = 0

    for year_str, papers in bronze["years"].items():
        if year_str in existing_years:
            print(f"  {venue} {year_str} — already processed, skipping")
            continue

        genderized_papers = []
        for paper in papers:
            genderized_authors = {}
            for i, author_name in enumerate(paper["authors"]):
                author_name = clean_name(author_name)
                result = gender_lookup.get(author_name, {})
                genderized_authors[i] = {
                    "name": author_name,
                    "gender": result.get("gender"),
                    "probability": result.get("probability"),
                }
            genderized_papers.append({**paper, "authors": genderized_authors})

        data["years"][year_str] = genderized_papers
        added += 1
        print(f"  {venue} {year_str} — processed {len(papers)} papers")

    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    if added == 0:
        print(f"  {venue} — nothing new to process")


def associate_paper_topics(venue):
    cache_path = f"{OUT}/topics/{venue}.json"
    openalex_path = f"{IN}/openalex_topics/{venue}.json"

    with open(openalex_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            paper_topics = json.load(f)
    else:
        paper_topics = {"venue": venue, "papers": {}}

    existing_titles = set(paper_topics["papers"].keys())
    added = 0

    for key in data["papers"]:
        title = data["papers"][key]["dblp_title"]
        if title in existing_titles:
            continue

        topic = (
            data["papers"][key]["openalex"]["primary_topic"]["display_name"]
            if data["papers"][key]["openalex"] is not None
            else None
        )
        paper_topics["papers"][title] = {"topic": topic}
        added += 1

    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(paper_topics, f, indent=2, ensure_ascii=False)

    if added > 0:
        print(f"  {venue} topics — added {added} new papers")
    else:
        print(f"  {venue} topics — nothing new to process")


if __name__ == "__main__":
    for venue in VENUES:
        print(f"\nGender mapping {venue}...")
        gender_map_names(venue)
        associate_paper_topics(venue)
