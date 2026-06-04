import json
import os

# Removing ICSE and ICSME to figure out error with openalex json parsing
VENUES = ["ICSE", "ECSA", "MSR", "ICSME"]
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

    with open("data/bronze/genderize/gender_lookup.json", "r", encoding="utf-8") as file:
        gender_data = json.load(file)

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
                # For each collaborator, lookup using gender lookup JSON in bronze directory
                for collaborator_index in paper["authors"]:

                    # Make sure the author themselves isn't counted
                    if collaborator_index != author_index:
                        collaborator_gender = gender_data[paper["authors"][collaborator_index]["name"]]["gender"]

                        # Increment the count relating to this collaborator's gender
                        try:
                            output[author["name"]]["collaborator_genders"][collaborator_gender] += 1
                        except KeyError:
                            output[author["name"]]["collaborator_genders"]["non-binary"] += 1


        with open(cache_path, "w") as f:
            json.dump(output, f, indent=2)


if __name__ == "__main__":
    for venue in VENUES:
        print(f"\nSynthesizing data for {venue}...")
        synthesize_data(venue)
