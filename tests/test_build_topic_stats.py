import json
import synthesize_gold


def _setup(tmp_path, fixture, monkeypatch):
    gold = tmp_path / "gold"
    gold.mkdir(exist_ok=True)
    (gold / "TEST.json").write_text(json.dumps(fixture))
    monkeypatch.setattr(synthesize_gold, "VENUES", ["TEST"])
    monkeypatch.setattr(synthesize_gold, "OUT", str(gold))
    synthesize_gold.build_topic_stats()
    return json.loads((gold / "topic_stats.json").read_text())


def test_accumulates_counts_by_gender_label(tmp_path, monkeypatch):
    fixture = {
        "Alice": {
            "gender_label": "female-presenting",
            "associated_topics": ["Testing"],
            "authorship_positions": [],
            "collaborator_genders": {},
        },
        "Bob": {
            "gender_label": "male-presenting",
            "associated_topics": ["Testing"],
            "authorship_positions": [],
            "collaborator_genders": {},
        },
    }
    result = _setup(tmp_path, fixture, monkeypatch)

    assert result["Testing"]["TEST"]["female_presenting"] == 1
    assert result["Testing"]["TEST"]["male_presenting"] == 1
    assert result["Testing"]["TEST"]["total_authors"] == 2


def test_label_key_uses_underscore_not_hyphen(tmp_path, monkeypatch):
    fixture = {
        "Alice": {
            "gender_label": "female-presenting",
            "associated_topics": ["Security"],
            "authorship_positions": [],
            "collaborator_genders": {},
        },
    }
    result = _setup(tmp_path, fixture, monkeypatch)

    assert "female_presenting" in result["Security"]["TEST"]
    assert "female-presenting" not in result["Security"]["TEST"]


def test_author_with_multiple_topics_counted_per_topic(tmp_path, monkeypatch):
    fixture = {
        "Alice": {
            "gender_label": "female-presenting",
            "associated_topics": ["Testing", "Refactoring"],
            "authorship_positions": [],
            "collaborator_genders": {},
        },
    }
    result = _setup(tmp_path, fixture, monkeypatch)

    assert result["Testing"]["TEST"]["female_presenting"] == 1
    assert result["Refactoring"]["TEST"]["female_presenting"] == 1


def test_author_with_no_topics_excluded(tmp_path, monkeypatch):
    fixture = {
        "Alice": {
            "gender_label": "female-presenting",
            "associated_topics": [],
            "authorship_positions": [],
            "collaborator_genders": {},
        },
    }
    result = _setup(tmp_path, fixture, monkeypatch)

    assert result == {}
