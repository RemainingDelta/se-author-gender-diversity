import json
import os

VENUES = ["ICSE", "ECSA", "MSR", "ICSME"]
IN = "data/silver"
OUT = "data/gold"


def classify_gender(gender, probability):
    if gender is None:
        return "unknown"
    if probability >= 0.70:
        if gender == "female":
            return "female-presenting"
        if gender == "male":
            return "male-presenting"
    return "unclassified"


def build_author_data(venue):
    cache_path = f"{OUT}/{venue}.json"
    if os.path.exists(cache_path):
        os.remove(cache_path)

    with open(f"{IN}/authors/{venue}.json", "r", encoding="utf-8") as file:
        author_data = json.load(file)

    with open(f"{IN}/topics/{venue}.json", "r", encoding="utf-8") as file:
        topic_data = json.load(file)

    output = {}

    for year, papers in author_data["years"].items():
        for paper in papers:
            for author_index, author in paper["authors"].items():
                name = author["name"]

                if name not in output:
                    output[name] = {
                        "gender_label": classify_gender(
                            author["gender"], author["probability"]
                        ),
                        "associated_topics": [],
                        "authorship_positions": [],
                        "collaborator_genders": {
                            "female_presenting": 0,
                            "male_presenting": 0,
                            "unclassified": 0,
                            "unknown": 0,
                        },
                    }

                # Topic
                try:
                    topic = topic_data["papers"][paper["title"]]["topic"]
                except KeyError:
                    topic = None

                if topic is not None and topic != "not found":
                    output[name]["associated_topics"].append(topic)

                # Authorship position
                output[name]["authorship_positions"].append(
                    int(author_index) / len(paper["authors"])
                )

                # Collaborator genders
                for collab_index, collab in paper["authors"].items():
                    if collab_index != author_index:
                        collab_label = classify_gender(
                            collab["gender"], collab["probability"]
                        )
                        collab_key = collab_label.replace("-", "_")
                        output[name]["collaborator_genders"][collab_key] += 1

    with open(cache_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)


def build_yearly_stats():
    stats = {}

    for venue in VENUES:
        with open(f"{IN}/authors/{venue}.json", "r", encoding="utf-8") as f:
            author_data = json.load(f)

        stats[venue] = {}

        for year, papers in author_data["years"].items():
            counts = {
                "total_authors": 0,
                "female_presenting": 0,
                "male_presenting": 0,
                "unclassified": 0,
                "unknown": 0,
                "first_author_total": 0,
                "first_author_female_presenting": 0,
                "first_author_male_presenting": 0,
                "first_author_unclassified": 0,
                "first_author_unknown": 0,
            }

            for paper in papers:
                for author_index, author in paper["authors"].items():
                    label = classify_gender(author["gender"], author["probability"])
                    label_key = label.replace("-", "_")

                    counts["total_authors"] += 1
                    counts[label_key] += 1

                    if author_index == "0":
                        counts["first_author_total"] += 1
                        counts[f"first_author_{label_key}"] += 1

            stats[venue][year] = counts

    with open(f"{OUT}/yearly_stats.json", "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)


def build_topic_stats():
    stats = {}

    for venue in VENUES:
        with open(f"{OUT}/{venue}.json", "r", encoding="utf-8") as f:
            gold_data = json.load(f)

        for author_name, author_info in gold_data.items():
            label = author_info["gender_label"]
            label_key = label.replace("-", "_")

            for topic in author_info["associated_topics"]:
                if topic not in stats:
                    stats[topic] = {}
                if venue not in stats[topic]:
                    stats[topic][venue] = {
                        "total_authors": 0,
                        "female_presenting": 0,
                        "male_presenting": 0,
                        "unclassified": 0,
                        "unknown": 0,
                    }

                stats[topic][venue]["total_authors"] += 1
                stats[topic][venue][label_key] += 1

    with open(f"{OUT}/topic_stats.json", "w", encoding="utf-8") as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)

    for venue in VENUES:
        print(f"\nBuilding author data for {venue}...")
        build_author_data(venue)

    print("\nBuilding yearly stats...")
    build_yearly_stats()

    print("\nBuilding topic stats...")
    build_topic_stats()
