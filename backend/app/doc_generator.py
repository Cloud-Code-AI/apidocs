from app.ai_engine import AIEngine
from app.analyze_repo import CodebaseAnalyzer


class DocumentationGenerator:
    def __init__(self, ai_engine: AIEngine):
        self.ai_engine = ai_engine

    async def generate(self, codebase_path: str) -> str:
        # Analyze the codebase
        analyzer = CodebaseAnalyzer(codebase_path)
        api_spec = analyzer.analyze()

        # Generate enhanced documentation for each endpoint
        enhanced_docs = []
        for path, methods in api_spec["paths"].items():
            for method, details in methods.items():
                prompt = f"Endpoint: {method.upper()} {path}\n"
                prompt += f"Summary: {details.get('summary', 'N/A')}\n"
                prompt += f"Description: {details.get('description', 'N/A')}\n"
                prompt += "Parameters:\n"
                for param in details.get("parameters", []):
                    prompt += f"- {param['name']} ({param['in']}): {param.get('description', 'N/A')}\n"

                enhanced_doc = await self.ai_engine.generate_documentation(prompt)
                enhanced_docs.append(enhanced_doc)

        # Generate documentation for schemas
        schemas = api_spec.get("components", {}).get("schemas", {})
        for schema_name, schema in schemas.items():
            prompt = f"Schema: {schema_name}\n"
            prompt += f"Description: {schema.get('description', 'N/A')}\n"
            prompt += "Properties:\n"
            for prop_name, prop in schema.get("properties", {}).items():
                prompt += f"- {prop_name}: {prop.get('type', 'N/A')} - {prop.get('description', 'N/A')}\n"

            enhanced_doc = await self.ai_engine.generate_documentation(prompt)
            enhanced_docs.append(enhanced_doc)

        return "\n\n".join(enhanced_docs)
