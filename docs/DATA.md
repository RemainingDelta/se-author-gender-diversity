# Phase 1 — Data Collection & Setup

## Overview of Data Ingested

To gather our data, we used the **DBLP Computer Science Bibliography**. We used the public API to retrieve each paper, alongside associated author data, from four different conferences: the **International Conference on Software Engineering** (`ICSE`), the **International Conference on Software Maintenance and Evolution** (`ICSME`), the **European Conference on Software Architecture** (`ECSA`), and the **Mining Software Repositories** conference (`MSR`). These conferences were selected for their status in the field of software engineering as longstanding and premier forums for innovation and discussion, representing a varied set of fields within software engineering. Once the papers were aggregated, we used **OpenAlex** to find the primary topics of each paper, and paired each paper with its associated topic. The final dataset consisted of **6,732 papers**, with **24,383 author appearances** and **10,822 unique authors**, spanning **2008–2023**.

## Data Synthesis

We used **Genderize** to determine the gender of authors based on their names. After compiling the list of authors, each one was assigned an assumed gender and a confidence score. The Genderize API always returns the more probable gender, so scores are always `0.5` or above. We then applied an additional threshold of `0.70` — authors where Genderize's confidence fell below this were marked as `unclassified`. These authors are still counted in the dataset but are excluded from gender ratio calculations. Once authors were given a gender, we created an entry for each author, grouped by venue. The author entry consists of the author’s name, their associated assumed gender, the topics associated with each paper they wrote, their **authorship positions** on the given papers, and the genders of their collaborators. The authorship positions are a decimal number from `0` to `1`, inclusive, and are determined by dividing the author’s 0-based index in the author list by the total number of authors for that paper. This means that an authorship position of `0` represents being the first credited author in a given paper, and an authorship position of `1` represents being the last. We also used these author profiles to map authorship data based on **year**, **topic**, and **venue**.

## Cleaning Activities

Several cleaning steps were applied across the pipeline:

- **Name normalisation** — before sending names to Genderize, HTML entities (e.g. `&apos;`) were decoded and trailing ID suffixes (e.g. `John Smith 0001`) were stripped using a regex. Names were also deduplicated across all venues so each unique name was only queried once.
- **Gender confidence filtering** — Genderize returns a probability for every name it recognises. Authors with a probability below `0.70` were labelled `unclassified` rather than assigned a gender. Authors whose names Genderize could not recognise at all were labelled `unknown`. Both groups are counted in totals but excluded from gender ratio calculations.
- **Topic filtering** — papers for which OpenAlex returned no topic or the string `"not found"` were silently dropped from topic-level aggregations. These papers still appear in authorship and yearly stats.
- **Incremental API caching** — only unique author names (deduplicated across all venues) were sent to Genderize. Results were written to `Gender_lookup.json` after every batch of 10 names, so partial runs could resume without re-querying already-fetched names.

## Data Storage Structure

The following structure describes the hierarchy of our data:
```
└── Data/
    ├── Bronze/                       # raw, unprocessed data from external APIs
    │   ├── DBLP/                     # paper metadata fetched from DBLP
    │   │   ├── ECSA.json
    │   │   ├── ICSE.json
    │   │   ├── ICSME.json
    │   │   └── MSR.json
    │   ├── Genderize/                # raw gender-inference data from Genderize.io
    │   │   ├── Gender_lookup.json    # name → {gender, probability} mapping
    │   │   └── Names.json            # deduplicated author first names sent to the API
    │   └── Openalex_topics/          # raw topic assignments from OpenAlex
    │       ├── ECSA.json
    │       ├── ICSE.json
    │       ├── ICSME.json
    │       └── MSR.json
    ├── Silver/                       # cleaned and joined intermediate data
    │   ├── Authors/                  # per-author profiles with inferred gender attached
    │   │   ├── ECSA.json
    │   │   ├── ICSE.json
    │   │   ├── ICSME.json
    │   │   └── MSR.json
    │   └── Topics/                   # papers joined with their OpenAlex topic label
    │       ├── ECSA.json
    │       ├── ICSE.json
    │       ├── ICSME.json
    │       └── MSR.json
    └── Gold/                         # aggregated, visualization-ready data
        ├── ECSA.json                 # per-author summary for ECSA (gender, topics, collaborator genders)
        ├── ICSE.json                 # per-author summary for ICSE
        ├── ICSME.json                 # per-author summary for ICSME
        ├── MSR.json                  # per-author summary for MSR
        ├── topic_stats.json          # author counts by research topic and venue
        └── yearly_stats.json         # author and first-author counts by venue and year
```

**Raw data** was stored in `Bronze`. This included conference publication data from **DBLP** — each paper had a `venue`, `year`, `title`, `authors`, and `id`, separated by venue. This also included raw gender-inference data (a list of names and their assumed gender) from **Genderize**, stored in `Genderize/`. Finally, raw topic data from **OpenAlex** is stored in `Openalex_topics/`.

**Processed data** was stored in `Silver`. This included matching authors with their assumed associated gender, stored in `Authors/`, and matching papers with their topic, stored in `Topics/`.

**Aggregate data** was stored in `Gold`. This included authorship summaries based on conference, venue, and year, as described above. This data was read directly for visualization.

## Pipeline Scripts

Scripts are organized to mirror the bronze/silver/gold pipeline structure. Run all scripts from the repo root.

| Script | Stage | Description |
|---|---|---|
| `src/bronze/fetch_bronze_dblp.py` | Bronze | Fetches paper and author data from the DBLP API |
| `src/bronze/fetch_bronze_open_alex.py` | Bronze | Fetches primary topic assignments from the OpenAlex API |
| `src/bronze/collect_names.py` | Bronze | Extracts and deduplicates unique author names for genderization |
| `src/bronze/fetch_genderize.py` | Bronze | Runs gender inference on collected names via the Genderize API |
| `src/bronze/random_sample.py` | Bronze | Generates a random sample of papers for manual validation |
| `src/silver/evaluate_data.py` | Silver | Joins gender labels and topic assignments onto author and paper records |
| `src/gold/synthesize_gold.py` | Gold | Aggregates silver data into venue, yearly, and topic summary files |
| `src/utils.py` | Shared | Utility functions (name cleaning, etc.) used across pipeline stages |

## Example Data Access

### By Venue

```python
import json

with open("data/gold/ICSE.json", "r", encoding="utf-8") as f:
    icse_data = json.load(f)

# Iterate over authors and print female-presenting ones
for name, profile in icse_data.items():
    if profile["gender_label"] == "female-presenting":
        print(name, profile["associated_topics"])
```

### By Topic

```python
with open("data/gold/topics_stats.json", "r", encoding="utf-8") as f:
    topic_stats = json.load(f)

# Female-presenting ratio per venue for a given topic
for venue, stats in topic_stats["Software Engineering Research"].items():
    classified = stats["female_presenting"] + stats["male_presenting"]
    print(f"{venue}: {stats['female_presenting'] / classified:.1%}")
```

### By Year

```python
with open("data/gold/yearly_stats.json", "r", encoding="utf-8") as f:
    yearly_stats = json.load(f)

# Overall vs. first-author female ratio per year for a given venue
for year, stats in sorted(yearly_stats["ICSE"].items()):
    overall = stats["female_presenting"] / (stats["female_presenting"] + stats["male_presenting"])
    fa = stats["first_author_female_presenting"] / (stats["first_author_female_presenting"] + stats["first_author_male_presenting"])
    print(f"{year}  overall: {overall:.1%}  first-author: {fa:.1%}")
```
