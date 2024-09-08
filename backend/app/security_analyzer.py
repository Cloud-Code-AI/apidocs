class SecurityAnalyzer:
    async def analyze(self, api_spec: dict) -> dict:
        security_issues = []

        # Check for global security schemes
        security_schemes = api_spec.get("components", {}).get("securitySchemes", {})
        if not security_schemes:
            security_issues.append("No global security schemes defined")

        # Check individual endpoints for security
        paths = api_spec.get("paths", {})
        for path, methods in paths.items():
            for method, details in methods.items():
                endpoint_security = details.get("security", [])
                if not endpoint_security:
                    security_issues.append(f"No security defined for {method.upper()} {path}")

                # Check for proper input validation
                parameters = details.get("parameters", [])
                for param in parameters:
                    if "schema" not in param:
                        security_issues.append(f"No schema defined for parameter {param['name']} in {method.upper()} {path}")

                # Check for rate limiting headers
                responses = details.get("responses", {})
                for response in responses.values():
                    headers = response.get("headers", {})
                    if "X-RateLimit-Limit" not in headers:
                        security_issues.append(f"No rate limiting headers for {method.upper()} {path}")
                        break

        # Check for HTTPS usage
        servers = api_spec.get("servers", [])
        if not any(server["url"].startswith("https://") for server in servers):
            security_issues.append("API does not enforce HTTPS")

        return {
            "security_issues": security_issues,
            "recommendations": [
                "Implement proper authentication and authorization mechanisms",
                "Use HTTPS for all endpoints",
                "Implement rate limiting to prevent abuse",
                "Validate and sanitize all input data",
                "Use parameterized queries to prevent SQL injection",
                "Implement proper error handling to avoid information leakage",
            ]
        }