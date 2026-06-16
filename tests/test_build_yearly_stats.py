import json
import synthesize_gold


def _setup(tmp_path, fixture, monkeypatch):
    silver = tmp_path / "silver" / "authors"
    silver.mkdir(parents=True)
    (silver / "TEST.json").write_text(json.dumps(fixture))
    gold = tmp_path / "gold"
    gold.mkdir()
    monkeypatch.setattr(synthesize_gold, "VENUES", ["TEST"])
    monkeypatch.setattr(synthesize_gold, "IN", str(tmp_path / "silver"))
    monkeypatch.setattr(synthesize_gold, "OUT", str(gold))
    synthesize_gold.build_yearly_stats()
    return json.loads((gold / "yearly_stats.json").read_text())["TEST"]


def test_total_and_first_author_counts(tmp_path, monkeypatch):
    fixture = {
        "years": {
            "2020": [
                {
                    "title": "Paper",
                    "authors": {
                        "0": {"name": "Alice", "gender": "female", "probability": 0.95},
                        "1": {"name": "Bob", "gender": "male", "probability": 0.80},
                    },
                }
            ]
        }
    }
    stats = _setup(tmp_path, fixture, monkeypatch)["2020"]

    assert stats["total_authors"] == 2
    assert stats["first_author_total"] == 1
    assert stats["first_author_female_presenting"] == 1
    assert stats["first_author_male_presenting"] == 0
    assert stats["male_presenting"] == 1


def test_label_key_uses_underscore_not_hyphen(tmp_path, monkeypatch):
    fixture = {
        "years": {
            "2021": [
                {
                    "title": "Paper",
                    "authors": {
                        "0": {"name": "Alice", "gender": "female", "probability": 0.90},
                    },
                }
            ]
        }
    }
    stats = _setup(tmp_path, fixture, monkeypatch)["2021"]

    assert "female_presenting" in stats
    assert stats["female_presenting"] == 1
    assert "female-presenting" not in stats


def test_below_threshold_counted_as_unclassified(tmp_path, monkeypatch):
    fixture = {
        "years": {
            "2022": [
                {
                    "title": "Paper",
                    "authors": {
                        "0": {"name": "X", "gender": "female", "probability": 0.50},
                    },
                }
            ]
        }
    }
    stats = _setup(tmp_path, fixture, monkeypatch)["2022"]

    assert stats["unclassified"] == 1
    assert stats["female_presenting"] == 0


def test_none_gender_counted_as_unknown(tmp_path, monkeypatch):
    fixture = {
        "years": {
            "2023": [
                {
                    "title": "Paper",
                    "authors": {
                        "0": {"name": "Y", "gender": None, "probability": None},
                    },
                }
            ]
        }
    }
    stats = _setup(tmp_path, fixture, monkeypatch)["2023"]

    assert stats["unknown"] == 1
    assert stats["total_authors"] == 1
