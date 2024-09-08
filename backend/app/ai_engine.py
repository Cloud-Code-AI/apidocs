import openai
from config import settings

class AIEngine:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY

    async def generate_documentation(self, api_spec):
        # Use OpenAI API to generate enhanced documentation
        response = await openai.Completion.acreate(
            engine="text-davinci-002",
            prompt=f"Generate detailed documentation for this API specification:\n{api_spec}",
            max_tokens=500
        )
        return response.choices[0].text.strip()

    async def generate_test_cases(self, endpoint_info):
        # Use OpenAI API to generate test cases
        response = await openai.Completion.acreate(
            engine="text-davinci-002",
            prompt=f"Generate test cases for this API endpoint:\n{endpoint_info}",
            max_tokens=300
        )
        return response.choices[0].text.strip()

    async def process_natural_language_query(self, query):
        # Use OpenAI API to process natural language queries
        response = await openai.Completion.acreate(
            engine="text-davinci-002",
            prompt=f"Interpret this API-related query and provide a response:\n{query}",
            max_tokens=200
        )
        return response.choices[0].text.strip()