import json
import re
import os
import gender_guesser.detector as gender

# Removing ICSE and ICSME to figure out error with openalex json parsing
# VENUES = ["ICSE", "ECSA", "MSR", "ICSME"]
VENUES = ["ECSA", "MSR"]
IN = "data/bronze"
OUT = "data/silver"


def gender_map_names(venue):
    detector = gender.Detector()
    cache_path = f"{OUT}/authors/{venue}.json"

    if os.path.exists(cache_path):
        print(f"  {venue} — already cached, skipping")
        return

    with open(f"{IN}/dblp/{venue}.json", "r") as file:
        data = json.load(file)

    for year in data["years"].values():
        # Iterate through each paper in the JSON, and create a version of the author, keyed
        # by index and containing name and inferred gender
        for paper in year:
            genderized_authors = {}

            for i in range(len(paper["authors"])):
                author_name = paper["authors"][i]

                # --- Clean data ---
                # fix apostrophe error
                author_name = author_name.replace("&apos;", "'")

                # remove any trailing ID numbers
                author_name = re.sub(" \d{4}", "", author_name)

                # assign result to new author format
                first_name = author_name.split(" ")[0]

                genderized_authors[i] = {
                    "name": author_name,
                    "gender": detector.get_gender(f"{first_name}"),
                }

            # Set the authors to the new, genderized authors
            paper["authors"] = genderized_authors

        with open(cache_path, "w") as f:
            json.dump(data, f, indent=2)

def associate_paper_topics(venue):
    cache_path = f"{OUT}/topics/{venue}.json"

    if os.path.exists(cache_path):
        print(f"  {venue} — already cached, skipping")
        return

    with open(f"{IN}/openalex_topics/{venue}.json", "r") as file:
        data = json.load(file)
        paper_topics = {
            "venue" : venue, 
            "papers" : {}
            }

    for key in data["papers"]:
        title = data["papers"][key]["dblp_title"]
        topic = data["papers"][key]["openalex"]["primary_topic"]["display_name"] if \
        data["papers"][key]["openalex"] is not None else None

        # Add paper info to the json
        paper_topics["papers"][title] = {"topic" : topic}

    with open(cache_path, "w") as f:
        json.dump(paper_topics, f, indent=2)


if __name__ == "__main__":
    for venue in VENUES:
        print(f"\nGender mapping {venue}...")
        gender_map_names(venue)
        associate_paper_topics(venue)
