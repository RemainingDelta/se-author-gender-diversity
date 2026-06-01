import json
import itertools

if __name__ == "__main__":
    write_path = "data/bronze/randomsample.txt"
    author_set = set()

    with open("data/bronze/dblp/ICSE.json", "r") as file:
        data = json.load(file)

    for year in data["years"].values():
        # Iterate through each paper in the JSON, and create a version of the author, keyed
        # by index and containing name and inferred gender
        for paper in year:

            for i in range(len(paper["authors"])):
                author_name = paper["authors"][i]
                author_set.add(author_name)
    
    sample = list(itertools.islice(author_set, 100))

    with open(write_path, "w") as f:
        json.dump(sample, f, indent=2)