import json
from unittest.mock import patch, MagicMock
import fetch_bronze_dblp


def _mock_response(hits):
    data = {
        "result": {
            "hits": {
                "@total": str(len(hits)),
                "hit": hits,
            }
        }
    }
    mock = MagicMock()
    mock.status_code = 200
    mock.text = json.dumps(data)
    mock.json.return_value = data
    return mock


def _hit(authors_value):
    info = {"title": "Paper", "year": "2020", "doi": None, "ee": None, "url": None}
    if authors_value is not None:
        info["authors"] = {"author": authors_value}
    return {"info": info}


def test_single_author_dict_normalized_to_list():
    with patch("requests.get", return_value=_mock_response([_hit({"text": "Alice Smith", "pid": "1"})])):
        papers = fetch_bronze_dblp.fetch_all_papers("TEST")

    assert papers[0]["authors"] == ["Alice Smith"]


def test_multi_author_list_passthrough():
    with patch("requests.get", return_value=_mock_response([_hit([{"text": "Alice"}, {"text": "Bob"}])])):
        papers = fetch_bronze_dblp.fetch_all_papers("TEST")

    assert papers[0]["authors"] == ["Alice", "Bob"]


def test_missing_authors_key_yields_empty_list():
    with patch("requests.get", return_value=_mock_response([_hit(None)])):
        papers = fetch_bronze_dblp.fetch_all_papers("TEST")

    assert papers[0]["authors"] == []
