from backend.app.analyze_repo import CodebaseAnalyzer

def process_update_analysis(url):
    analyzer = CodebaseAnalyzer(repo_path=url)
    api_spec = analyzer.analyze()
    file_name = request.url.split("/")[-1].replace('.git', '').replace('/', '_') + '.json'
    with open("static/" + file_name, "w") as f:
        json.dump(api_spec, f, indent=4)