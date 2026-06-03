import json
import os

# Removing ICSE and ICSME to figure out error with openalex json parsing
# VENUES = ["ICSE", "ECSA", "MSR", "ICSME"]
VENUES = ["ECSA", "MSR"]
IN = "data/silver"
OUT = "data/gold"


def synthesize_data(venue):
    cache_path = f"{OUT}/{venue}.json"

    if os.path.exists(cache_path):
        print(f"  {venue} — already cached, skipping")
        return

    with open(f"{IN}/authors/{venue}.json", "r", encoding="utf-8") as file:
        author_data = json.load(file)

    with open(f"{IN}/topics/{venue}.json", "r", encoding="utf-8") as file:
        topic_data = json.load(file)

    output = {}

    for year in author_data["years"].values():
        for paper in year:
            for author_index in paper["authors"]:
                author = paper["authors"][author_index]

                if author["name"] not in output:

                    # If the author is not recorded yet, create an entry in the JSON for them
                    output[author["name"]] = {
                        "gender" : author["gender"],
                        "confidence" : author["probability"],
                        "associated_topics" : [],
                        "authorship_positions" : [],
                        "collaborator_genders" : {
                            "male" : 0,
                            "female" : 0,
                            "non-binary" : 0
                        }
                    }

                # Now that the author is in the JSON, update their stats with the new info
                # Add the paper topic to their associated_topics
                # If paper cannot be found (Characters don't perfectly match, slightly different title from OpenAlex),
                # then simply enter "not found" in paper topic
                try: 
                    output[author["name"]]["associated_topics"].append(topic_data["papers"][paper["title"]]["topic"])
                except KeyError:
                    output[author["name"]]["associated_topics"].append("not found")

                # Add their position in this paper to their authorship_positions, 
                # divided by the total number of authors in this paper
                output[author["name"]]["authorship_positions"].append(int(author_index) / len(paper["authors"]))

                # TODO: Update the info on collaborators' genders

        with open(cache_path, "w") as f:
            json.dump(output, f, indent=2)


if __name__ == "__main__":
    for venue in VENUES:
        print(f"\nGender mapping {venue}...")
        synthesize_data(venue)
