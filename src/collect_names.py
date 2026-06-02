import json
import re

VENUES = ["ICSE", "ECSA", "MSR", "ICSME"]
OUT = "data/bronze/genderize/names.json"


def clean_name(name):
    name = name.replace("&apos;", "'")
    name = re.sub(r" \d{4}", "", name)
    return name


if __name__ == "__main__":
    unique_names = set()

    for venue in VENUES:
        d = json.load(open(f"data/bronze/dblp/{venue}.json"))
        for papers in d["years"].values():
            for paper in papers:
                for name in paper["authors"]:
                    unique_names.add(clean_name(name))

    names = sorted(unique_names)

    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(names, f, indent=2, ensure_ascii=False)

    print(f"saved {len(names)} unique names → {OUT}")
