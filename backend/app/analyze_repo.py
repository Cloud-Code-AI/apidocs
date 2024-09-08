import os
import ast
import inspect
from typing import List, Dict, Any
import importlib
import sys
import tempfile
from github import Github
from github import GithubException

class CodebaseAnalyzer:
    def __init__(self, repo_url: str, github_token: str = None):
        self.repo_url = repo_url
        self.github_token = github_token
        self.api_spec = {
            "openapi": "3.0.0",
            "info": {
                "title": "Generated API",
                "version": "1.0.0"
            },
            "paths": {},
            "components": {
                "schemas": {}
            }
        }

    def analyze(self) -> Dict[str, Any]:
        with tempfile.TemporaryDirectory() as tmp_dir:
            self._clone_repo(tmp_dir)
            self._process_directory(tmp_dir)
        return self.api_spec

    def _clone_repo(self, tmp_dir: str):
        g = Github(self.github_token)
        try:
            repo_name = self.repo_url.split('/')[-2:]
            repo_name = '/'.join(repo_name)
            repo = g.get_repo(repo_name)
            repo.clone_url
            os.system(f"git clone {repo.clone_url} {tmp_dir}")
        except GithubException as e:
            print(f"Error cloning repository: {e}")
            raise

    def _process_directory(self, directory: str):
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith('.py'):
                    file_path = os.path.join(root, file)
                    self._process_file(file_path)

    def _process_file(self, file_path: str):
        with open(file_path, 'r') as file:
            tree = ast.parse(file.read())

        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                self._process_class(node, file_path)

    def _process_class(self, node: ast.ClassDef, file_path: str):
        class_name = node.name
        module_path = os.path.relpath(file_path, self.root_dir).replace('/', '.').replace('.py', '')
        
        # Dynamically import the module
        spec = importlib.util.spec_from_file_location(module_path, file_path)
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_path] = module
        spec.loader.exec_module(module)
        
        class_obj = getattr(module, class_name)

        if hasattr(class_obj, 'router'):  # FastAPI router
            self._process_fastapi_router(class_obj)
        elif hasattr(class_obj, 'as_view'):  # Django class-based view
            self._process_django_view(class_obj)

    def _process_fastapi_router(self, router):
        for route in router.routes:
            path = route.path
            for method in route.methods:
                method = method.lower()
                self.api_spec['paths'].setdefault(path, {})[method] = {
                    'summary': route.name,
                    'description': inspect.getdoc(route.endpoint) or '',
                    'parameters': self._get_parameters(route.endpoint),
                    'responses': {
                        '200': {
                            'description': 'Successful Response'
                        }
                    }
                }

    def _process_django_view(self, view_class):
        view_instance = view_class()
        for method in ['get', 'post', 'put', 'delete', 'patch']:
            if hasattr(view_instance, method):
                handler = getattr(view_instance, method)
                path = f"/{view_class.__name__.lower()}"
                self.api_spec['paths'].setdefault(path, {})[method] = {
                    'summary': view_class.__name__,
                    'description': inspect.getdoc(handler) or '',
                    'parameters': self._get_parameters(handler),
                    'responses': {
                        '200': {
                            'description': 'Successful Response'
                        }
                    }
                }

    def _get_parameters(self, func) -> List[Dict[str, Any]]:
        params = []
        sig = inspect.signature(func)
        for name, param in sig.parameters.items():
            if name not in ['self', 'request']:
                param_info = {
                    'name': name,
                    'in': 'query',
                    'required': param.default == inspect.Parameter.empty,
                    'schema': {
                        'type': 'string'  # Default to string, can be improved
                    }
                }
                params.append(param_info)
        return params