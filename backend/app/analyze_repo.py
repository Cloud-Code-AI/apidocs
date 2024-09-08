import os
import ast
import inspect
from typing import List, Dict, Any
import importlib
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed
import re
from github import Github
from github import GithubException
from backend.app.ai_engine import AIEngine
from backend.helpers.code_chunker import chunk_code
import traceback
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

class CodebaseAnalyzer:
    def __init__(self, repo_path: str, github_token: str = None):
        self.repo_path = repo_path
        self.root_dir = repo_path
        self.github_token = github_token
        self.api_spec = {
            "openapi": "3.0.0",
            "info": {"title": "Generated API", "version": "1.0.0"},
            "paths": {},
            "components": {"schemas": {}},
        }
        self.is_github_url = repo_path.startswith("https://github.com/")
        self.ai_engine = AIEngine()
    
    def parse_repository(self, repo_path: str):
        with ThreadPoolExecutor(max_workers=os.cpu_count()) as executor:
            futures = []
            for root, _, files in os.walk(repo_path):
                for file in files:
                    self.total_files_processed += 1
                    if file.endswith(
                        (".py", ".js", ".ts", ".rs")
                    ):  # Add more extensions as needed
                        file_path = os.path.join(root, file)
                        futures.append(executor.submit(self.parse_file, file_path))

            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    logger.error(f"Error in parsing file: {str(e)}")
                    logger.error(traceback.format_exc())

    def parse_file(self, file_path: str):
        logger.debug(f"Parsing file: {file_path}")
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read()

            language = self.get_language_from_extension(file_path)
            chunked_code = chunk_code(content, language)

            for section, items in chunked_code.items():
                if isinstance(items, dict):
                    for name, code_info in items.items():
                        self.process_code_block(code_info, file_path, section, name)
                elif isinstance(items, list):
                    for i, code_info in enumerate(items):
                        self.process_code_block(
                            code_info, file_path, section, f"{section}_{i}"
                        )
            logger.debug(f"Successfully parsed file: {file_path}")
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {str(e)}")
            logger.error(traceback.format_exc())

    async def analyze(self) -> Dict[str, Any]:
        if self.is_github_url:
            with tempfile.TemporaryDirectory() as tmp_dir:
                self._clone_repo(tmp_dir)
                self._process_directory(tmp_dir)
        else:
            self._process_directory(self.repo_path)
        await self._enrich_api_spec_with_context()
        await self._generate_documentation()
        return self.api_spec

    def _clone_repo(self, tmp_dir: str):
        if not self.is_github_url:
            return

        g = Github(self.github_token)
        try:
            repo_name = self.repo_path.split("/")[-2:]
            repo_name = "/".join(repo_name)
            repo = g.get_repo(repo_name)
            os.system(f"git clone {repo.clone_url} {tmp_dir}")
        except GithubException as e:
            print(f"Error cloning repository: {e}")
            raise

    def _process_directory(self, directory: str):
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(".py"):
                    file_path = os.path.join(root, file)
                    self._process_file(file_path)

    def _process_file(self, file_path: str):
        with open(file_path, "r") as file:
            content = file.read()
            tree = ast.parse(content)

        framework = self._identify_framework(content)
        routes = self._extract_routes(content, framework)

        if framework != "Unknown" or routes:
            self._add_to_api_spec(file_path, framework, routes)

        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                self._process_class(node, file_path)

    def _identify_framework(self, file_content: str) -> str:
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

    def _extract_routes(self, file_content: str, framework: str) -> List[str]:
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
            routes = re.findall(r'(axios|fetch)\([\'"](.+?)[\'"]\)', file_content)
        return routes

    def _add_to_api_spec(self, file_path: str, framework: str, routes: List[str]):
        relative_path = os.path.relpath(file_path, self.root_dir)
        for route in routes:
            if isinstance(route, tuple):
                method, path = route
            else:
                method, path = "get", route

            self.api_spec["paths"].setdefault(path, {})[method.lower()] = {
                "summary": f"{framework.capitalize()} route in {relative_path}",
                "description": f"Automatically detected {framework} route",
                "responses": {"200": {"description": "Successful Response"}},
            }

    def _process_class(self, node: ast.ClassDef, file_path: str):
        class_name = node.name
        module_path = (
            os.path.relpath(file_path, self.root_dir)
            .replace("/", ".")
            .replace(".py", "")
        )

        # Dynamically import the module
        spec = importlib.util.spec_from_file_location(module_path, file_path)
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_path] = module
        spec.loader.exec_module(module)

        class_obj = getattr(module, class_name)
        print(inspect.getsource(class_obj))
        if hasattr(class_obj, "router"):  # FastAPI router
            self._process_fastapi_router(class_obj)
        elif hasattr(class_obj, "as_view"):  # Django class-based view
            self._process_django_view(class_obj)

    def _process_fastapi_router(self, router):
        for route in router.routes:
            path = route.path
            for method in route.methods:
                method = method.lower()
                self.api_spec["paths"].setdefault(path, {})[method] = {
                    "summary": route.name,
                    "description": inspect.getdoc(route.endpoint) or "",
                    "parameters": self._get_parameters(route.endpoint),
                    "responses": {"200": {"description": "Successful Response"}},
                }

    def _process_django_view(self, view_class):
        view_instance = view_class()
        for method in ["get", "post", "put", "delete", "patch"]:
            if hasattr(view_instance, method):
                handler = getattr(view_instance, method)
                path = f"/{view_class.__name__.lower()}"
                self.api_spec["paths"].setdefault(path, {})[method] = {
                    "summary": view_class.__name__,
                    "description": inspect.getdoc(handler) or "",
                    "parameters": self._get_parameters(handler),
                    "responses": {"200": {"description": "Successful Response"}},
                }

    def _get_parameters(self, func) -> List[Dict[str, Any]]:
        params = []
        sig = inspect.signature(func)
        for name, param in sig.parameters.items():
            if name not in ["self", "request"]:
                param_info = {
                    "name": name,
                    "in": "query",
                    "required": param.default == inspect.Parameter.empty,
                    "schema": {"type": "string"},  # Default to string, can be improved
                }
                params.append(param_info)
        return params

    async def _enrich_api_spec_with_context(self):
        for path, methods in self.api_spec['paths'].items():
            for method, details in methods.items():
                query = f"{method} {path}"
                results = self.repo_analyzer.query(query)
                if results:
                    context = results[0]  # Take the most relevant result
                    details['context'] = {
                        'file_path': context['file_path'],
                        'relevance_score': context['relevance_score'],
                        # Add other relevant fields from the context
                    }

    async def _generate_documentation(self):
        for path, methods in self.api_spec['paths'].items():
            for method, details in methods.items():
                endpoint_info = {
                    'path': path,
                    'method': method,
                    'details': details
                }
                documentation = await self.ai_engine.generate_documentation(endpoint_info)
                details['ai_generated_documentation'] = documentation

                test_cases = await self.ai_engine.generate_test_cases(endpoint_info)
                details['ai_generated_test_cases'] = test_cases
