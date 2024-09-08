from backend.app.analyze_repo import CodebaseAnalyzer
import requests
import json

def process_updates(url):
    analyzer = CodebaseAnalyzer(repo_path=url)
    api_spec = analyzer.analyze()
    file_name = url.split("/")[-1].replace('.git', '').replace('/', '_') + '.json'
    version = 0
    try:
        with open("static/" + file_name, "r") as f:
            version = json.load(f)["info"]["version"]
    except FileNotFoundError:
        version = 0
    api_spec["info"]["version"] = f"1.0.{version + 1}"

    with open("static/" + file_name, "w") as f:
        json.dump(api_spec, f, indent=4)