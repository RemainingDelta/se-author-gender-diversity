import requests

names = {}

def evaluate_name(name):
    if (name not in names):
        response = requests.get(f"https://api.genderize.io?name={name}").json()
        
        names[name] = {
            "gender": response["gender"],
            "probability": response["probability"],
            "count": response["count"]
        }

    return names[name]