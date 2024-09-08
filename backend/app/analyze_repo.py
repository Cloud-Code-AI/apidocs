import os
import ast
import inspect
from typing import List, Dict, Any
import importlib
import sys
import tempfile
import re
from github import Github
from github import GithubException
import json
from .ai_engine import AIEngine


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
            "servers": [{"url": "https://api.example.com"}],
        }
        self.is_github_url = repo_path.startswith("https://github.com/")
        self.ai_engine = AIEngine()

    def analyze(self) -> Dict[str, Any]:
        if self.is_github_url:
            with tempfile.TemporaryDirectory() as tmp_dir:
                self._clone_repo(tmp_dir)
                self._process_directory(tmp_dir)
        else:
            self._process_directory(self.repo_path)
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
                try:
                    self._process_class(node, file_path)
                except Exception as e:
                    print(f"Error processing class: {e}")

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

    def _extract_routes(
        self, file_content: str, framework: str
    ) -> List[Dict[str, Any]]:
        routes = []
        tree = ast.parse(file_content)

        if framework == "flask":
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    for decorator in node.decorator_list:
                        if isinstance(decorator, ast.Call) and isinstance(
                            decorator.func, ast.Attribute
                        ):
                            if decorator.func.attr == "route":
                                route = decorator.args[0].s
                                methods = [
                                    "GET",
                                    "POST",
                                    "PUT",
                                    "DELETE",
                                ]  # Default method
                                if len(decorator.keywords) > 0:
                                    for keyword in decorator.keywords:
                                        if keyword.arg == "methods":
                                            methods = [m.s for m in keyword.value.elts]
                                    for method in methods:
                                        routes.append(
                                            {
                                                "route": route,
                                                "method": method,
                                                "function_name": node.name,
                                                "node": node,
                                            }
                                        )
        elif framework == "fastapi":
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef) or isinstance(
                    node, ast.AsyncFunctionDef
                ):
                    for decorator in node.decorator_list:
                        if isinstance(decorator, ast.Call) and isinstance(
                            decorator.func, ast.Attribute
                        ):
                            if decorator.func.attr in ["get", "post", "put", "delete"]:
                                route = decorator.args[0].s
                                method = decorator.func.attr
                                routes.append(
                                    {
                                        "route": route,
                                        "method": method,
                                        "function_name": node.name,
                                        "node": node,
                                    }
                                )
        # Add similar logic for other frameworks

        return routes

    def _extract_function_content(self, node: ast.FunctionDef) -> str:
        return ast.unparse(node)

    def _add_to_api_spec(
        self, file_path: str, framework: str, routes: List[Dict[str, Any]]
    ):
        for route_info in routes:
            method, path = route_info["method"], route_info["route"]
            data = {
                "method": method,
                "content": ast.unparse(route_info["node"]),
                "path": path,
            }
            schema, usage = self.ai_engine.generate_api_spec(data)
            path = path.replace("int", "")
            path = path.replace("str", "")
            path = path.replace(":", "")
            path = path.replace("<", "{").replace(">", "}")
            path = path.replace("<path:", "{").replace(">", "}")
            insights, usage = self.ai_engine.generate_insights(schema)
            if "paths" in schema:
                schema["paths"][path][method.lower()]["insights"] = insights
                self.api_spec["paths"].setdefault(path, {})[method.lower()] = schema[
                    "paths"
                ][path][method.lower()]
            elif path in schema:
                schema[path][method.lower()]["insights"] = insights
                self.api_spec["paths"].setdefault(path, {})[method.lower()] = schema[
                    path
                ][method.lower()]

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
