class PerformanceAnalyzer:
    async def analyze(self, api_spec: dict) -> dict:
        performance_insights = []
        optimization_suggestions = []

        # Analyze endpoint complexity
        paths = api_spec.get("paths", {})
        for path, methods in paths.items():
            for method, details in methods.items():
                # Check for potential N+1 query problems
                if "get" in method and "{" in path:
                    performance_insights.append(
                        f"Potential N+1 query issue in {method.upper()} {path}"
                    )
                    optimization_suggestions.append(
                        f"Consider implementing batch fetching for {method.upper()} {path}"
                    )

                # Check for pagination
                parameters = details.get("parameters", [])
                if not any(
                    param["name"] in ["limit", "offset", "page"] for param in parameters
                ):
                    performance_insights.append(
                        f"No pagination parameters found for {method.upper()} {path}"
                    )
                    optimization_suggestions.append(
                        f"Implement pagination for {method.upper()} {path} to improve performance for large datasets"
                    )

                # Check for caching headers
                responses = details.get("responses", {})
                for response in responses.values():
                    headers = response.get("headers", {})
                    if "Cache-Control" not in headers and "ETag" not in headers:
                        performance_insights.append(
                            f"No caching headers found for {method.upper()} {path}"
                        )
                        optimization_suggestions.append(
                            f"Implement caching mechanisms for {method.upper()} {path} to reduce server load"
                        )

        # Check for batch operations
        if not any("batch" in path.lower() for path in paths):
            performance_insights.append("No batch operations found in the API")
            optimization_suggestions.append(
                "Consider implementing batch operations for frequently used endpoints"
            )

        # Analyze data models for potential performance issues
        schemas = api_spec.get("components", {}).get("schemas", {})
        for schema_name, schema in schemas.items():
            properties = schema.get("properties", {})
            if len(properties) > 20:
                performance_insights.append(
                    f"Large number of properties ({len(properties)}) in schema {schema_name}"
                )
                optimization_suggestions.append(
                    f"Consider breaking down {schema_name} into smaller, more focused schemas"
                )

        return {
            "performance_insights": performance_insights,
            "optimization_suggestions": optimization_suggestions,
            "general_recommendations": [
                "Implement proper database indexing",
                "Use caching mechanisms (e.g., Redis) for frequently accessed data",
                "Optimize database queries",
                "Implement asynchronous processing for time-consuming tasks",
                "Use content delivery networks (CDNs) for static assets",
                "Implement rate limiting to prevent abuse and ensure fair usage",
            ],
        }
