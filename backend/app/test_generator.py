from app.ai_engine import AIEngine

class TestCaseGenerator:
    def __init__(self, ai_engine: AIEngine):
        self.ai_engine = ai_engine

    async def generate(self, endpoint_info: dict) -> str:
        # Extract relevant information from the endpoint info
        method = endpoint_info.get("method", "").upper()
        path = endpoint_info.get("path", "")
        parameters = endpoint_info.get("parameters", [])
        request_body = endpoint_info.get("requestBody", {})
        responses = endpoint_info.get("responses", {})

        # Create a prompt for the AI to generate test cases
        prompt = f"Generate test cases for the following API endpoint:\n"
        prompt += f"Method: {method}\n"
        prompt += f"Path: {path}\n"
        prompt += "Parameters:\n"
        for param in parameters:
            prompt += f"- {param['name']} ({param['in']}): {param.get('description', 'N/A')}\n"
        
        if request_body:
            prompt += "Request Body:\n"
            prompt += str(request_body) + "\n"
        
        prompt += "Responses:\n"
        for status, response in responses.items():
            prompt += f"- {status}: {response.get('description', 'N/A')}\n"

        prompt += "\nPlease generate a set of test cases covering various scenarios, including:"
        prompt += "\n1. Happy path (successful request)"
        prompt += "\n2. Invalid input"
        prompt += "\n3. Edge cases"
        prompt += "\n4. Error handling"

        # Generate test cases using the AI engine
        test_cases = await self.ai_engine.generate_test_cases(prompt)
        return test_cases