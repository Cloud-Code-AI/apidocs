from kaizen.llms.provider import LLMProvider
import json

class AIEngine:
    def __init__(self):
        self.llm_provider = LLMProvider()

    def generate_api_spec(self, api_spec):
        prompt = f"""Generate a detailed OpenAPI 3.1 specification document based on the following API structure:

{json.dumps(api_spec, indent=2)}

Please enhance the specification with the following:
1. Detailed descriptions for each endpoint
2. Appropriate request and response schemas
3. Example requests and responses
4. Any additional metadata that would be useful for developers
5. only create the path and method provided in api_spec above

Return the result as a valid JSON string representing the complete OpenAPI 3.1 specification. Just return the JSON inside the method of the path."""

        response, usage = self.llm_provider.chat_completion_with_json(prompt=prompt)
        return response, usage
