import os
import re


def identify_framework(file_content):
    frameworks = {
        "flask": r"from\s+flask\s+import",
        "django": r"from\s+django\s+import",
        "fastapi": r"from\s+fastapi\s+import",
        "express": r"express\(\s*\)",
        "react": r"import\s+React",
        "angular": r"@angular/core",
        "vue": r"new\s+Vue\(",
    }

    for framework, pattern in frameworks.items():
        if re.search(pattern, file_content):
            return framework
    return "Unknown"


def extract_routes(file_content, framework):
    routes = []
    if framework == "flask":
        routes = re.findall(r'@app.route\([\'"](.+?)[\'"]\)', file_content)
    elif framework == "django":
        routes = re.findall(r'path\([\'"](.+?)[\'"]\s*,', file_content)
    elif framework == "fastapi":
        routes = re.findall(
            r'@app\.(get|post|put|delete)\([\'"](.+?)[\'"]\)', file_content
        )
    elif framework == "express":
        routes = re.findall(
            r'app\.(get|post|put|delete)\([\'"](.+?)[\'"]\s*,', file_content
        )
    elif framework in ["react", "angular", "vue"]:
        # For frontend frameworks, we might look for API calls instead
        routes = re.findall(r'(axios|fetch)\([\'"](.+?)[\'"]\)', file_content)
    return routes


def analyze_file(file_path):
    with open(file_path, "r") as file:
        content = file.read()
        framework = identify_framework(content)
        routes = extract_routes(content, framework)
        return framework, routes


def analyze_directory(directory):
    results = {}
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith((".py", ".js", ".ts", ".jsx", ".tsx")):
                file_path = os.path.join(root, file)
                framework, routes = analyze_file(file_path)
                if framework != "Unknown" or routes:
                    results[file_path] = {"framework": framework, "routes": routes}
    return results


def main():
    directory = input("Enter the directory path to analyze: ")
    results = analyze_directory(directory)

    for file_path, data in results.items():
        print(f"\nFile: {file_path}")
        print(f"Framework: {data['framework']}")
        if data["routes"]:
            print("Routes/API endpoints:")
            for route in data["routes"]:
                print(f"  - {route}")
        else:
            print("No routes/API endpoints found.")


if __name__ == "__main__":
    main()
