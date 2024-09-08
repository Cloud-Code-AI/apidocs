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

    def generate_insights(self, api_spec):
        prompt = f"""Analyze the following API specification for the path and method provided:

{json.dumps(api_spec, indent=2)}

Generate a detailed report with insights on performance, security, optimization, and general API design. Provide the output in standard JSON format with the following structure:
Keep all the feedback related to API spec and dont provide unnecessary feedback.

{{
  "performance_insights": [
    // List of performance-related insights and recommendations
  ],
  "security_insights": [
    // List of security-related insights and recommendations
  ],
  "optimization_insights": [
    // List of optimization-related insights and recommendations
  ],
  "additional_metadata": {{
    // Any additional metadata useful for developers
  }}
  }}

Ensure that all insights are specific to the given path and method, and provide actionable recommendations where applicable."""

        response, usage = self.llm_provider.chat_completion_with_json(prompt=prompt)
        return response, usage