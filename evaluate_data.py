import requests

names = {}

def evaluate_name(name):
  if (name not in names):
    names[name] = requests.get(f"https://api.genderize.io?name={name}").json()["gender"]
  
  return names[name]