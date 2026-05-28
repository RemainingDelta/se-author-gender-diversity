import requests
import json
import os

names = {}

VENUES = ["ICSE", "ECSA", "MSR", "ICSME"]
IN     = "data/bronze"
OUT    = "data/silver"

def evaluate_name(name):
    names = {}
    
    if (name not in names):
        response = requests.get(f"https://api.genderize.io?name={name}").json()
        
        names[name] = {
            "gender": response["gender"],
            "probability": response["probability"]
        }

    return names

def gender_map_names(venue):

    names = {}
    cache_path = f"{OUT}/{venue}.json"
    
    if os.path.exists(cache_path):
        print(f"  {venue} — already cached, skipping")
        return

    with open(f"{IN}/{venue}.json", 'r') as file:
        data = json.load(file)

    for year in data["years"].values():

        # Iterate through each paper in the JSON, and create a version of the author set with
        # associated index, genders, and probabilities
        for paper in year:
            genderized_authors = {}

            for i in range(len(paper["authors"])):
                author_name = paper["authors"][i]
                names = evaluate_name(author_name)

                genderized_authors[i] = {
                    "name" : author_name,
                    "gender" : names[author_name]["gender"],
                    "probability" : names[author_name]["probability"]
                    }     

            # Set the authors to the new, genderized authors 
            paper["authors"] = genderized_authors
        
        with open(cache_path, "w") as f:
            json.dump(data, f, indent=2)

if __name__ == "__main__":
    for venue in VENUES:
        print(f"\nGender mapping {venue}...")
        gender_map_names(venue)