Phase 1 - Data Collection/Setup


Overview of Data Ingested

To gather our data, we used the DBLP Computer Science Bibliography. We used the public API to retrieve each paper, alongside associated author data, from four different conferences: the International Conference on Software Engineering (ICSE), the International Conference on Software Maintenance and Evolution (ICSME), the European Conference on Software Architecture (ECSA), and the Mining Software Repositories conference (MSR). These conferences were selected for their status in the field of software engineering as longstanding and premier forums for innovation and discussion, representing a varied set of fields within software engineering. Once the papers were aggregated, we used OpenAlex to find the primary topics of each paper, and paired each paper with its associated topic. The final dataset consisted of 6,732 papers, with 24,383 author appearances and 10,822 unique authors.

Description of Data Synthesis

We used Genderize to determine the gender of authors based on their names. After compiling the list of authors, each one was assigned associated assumed gender gender and a confidence score ranging from 0.5 to 1, according to the Genderize API. Once authors were given a gender, we created an entry for each author, grouped by conference venue. The author entry consists of the author’s name, their associated assumed gender, the topics associated with each paper they wrote, their authorship positions on the given papers, and the genders of their collaborators. The authorship positions are a decimal number from 0 to 1, inclusive, and are determined by what index the given author is listed among the paper’s authors, divided by the total number of authors for that paper. This means that an authorship position of 0 represents being the first credited author in a given paper, and an authorship position of 1 represents being the last. We also used these author profiles to map authorship data based on year, topic, and conference.

Data Storage Structure

The following structure describes the hierarchy of our data:

└── Data/
    ├── Bronze/
    │   ├── DBLP/
    │   │   ├── ECSA.json
    │   │   ├── ICSE.json
    │   │   ├── ICSM.json
    │   │   └── MSR.json
    │   ├── Genderize/
    │   │   ├── Gender_lookup.json
    │   │   └── Names.json
    │   └── Openalex_topics/
    │       ├── ECSA.json
    │       ├── ICSE.json
    │       ├── ICSM.json
    │       └── MSR.json
    ├── Silver/
    │   ├── Authors/
    │   │   ├── ECSA.json
    │   │   ├── ICSE.json
    │   │   ├── ICSM.json
    │   │   └── MSR.json
    │   └── Topics/
    │       ├── ECSA.json
    │       ├── ICSE.json
    │       ├── ICSM.json
    │       └── MSR.json
    └── Gold/
        ├── ECSA.json
        ├── ICSE.json
        ├── ICSM.json
        ├── MSR.json
        ├── Topics_stats.json
        └── Yearly_stats.json


Raw data was stored in Bronze. This included conference publication data stored in the DBLP. Each paper had a venue, year, title, authors, and id. These were separated by venue. This also included raw gender-inference data, including a list of names and their assumed associated gender, stored in Genderize. Finally, raw topic data is stored in Openalex_topics.

Processed data was stored in Silver. This included matching authors with their assumed associated gender, stored in Authors. This also included matching papers with their topic, stored in Topics.

Aggregate data was stored in Gold. This included authorship based on conference, venue, and year, as described above. This data was read directly for visualization.

Example Data Access

**By Venue**

```python
import json

with open("data/gold/ICSE.json", "r", encoding="utf-8") as f:
    icse_data = json.load(f)

# Iterate over authors and print female-presenting ones
for name, profile in icse_data.items():
    if profile["gender_label"] == "female-presenting":
        print(name, profile["associated_topics"])
```

**By Topic**

```python
with open("data/gold/topics_stats.json", "r", encoding="utf-8") as f:
    topic_stats = json.load(f)

# Female-presenting ratio per venue for a given topic
for venue, stats in topic_stats["Software Engineering Research"].items():
    classified = stats["female_presenting"] + stats["male_presenting"]
    print(f"{venue}: {stats['female_presenting'] / classified:.1%}")
```

**By Year**

```python
with open("data/gold/yearly_stats.json", "r", encoding="utf-8") as f:
    yearly_stats = json.load(f)

# Overall vs. first-author female ratio per year for a given venue
for year, stats in sorted(yearly_stats["ICSE"].items()):
    overall = stats["female_presenting"] / (stats["female_presenting"] + stats["male_presenting"])
    fa = stats["first_author_female_presenting"] / (stats["first_author_female_presenting"] + stats["first_author_male_presenting"])
    print(f"{year}  overall: {overall:.1%}  first-author: {fa:.1%}")
```