from kaizen.llms.provider import LLMProvider

class AIEngine:
    def __init__(self):
        self.llm_provider = LLMProvider()

    async def generate_documentation(self, api_spec):
        prompt = f"Generate detailed documentation for this API specification in OpenAPI 3.1 format:\n{api_spec}"
        response, usage = self.llm_provider.chat_completion(prompt=prompt)
        return response, usage

    async def generate_test_cases(self, endpoint_info):
        prompt = f"Generate test cases for this API endpoint:\n{endpoint_info}"
        response, usage = self.llm_provider.chat_completion(prompt=prompt)
        return response, usage

    async def process_natural_language_query(self, query):
        prompt = f"Interpret this API-related query and provide a response:\n{query}"
        response, usage = self.llm_provider.chat_completion(prompt=prompt)
        return response, usage
