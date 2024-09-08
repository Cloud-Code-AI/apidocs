from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

class CustomDocs:
    def __init__(self, app: FastAPI, docs_url: str, api_url: str):
        self.app = app
        self.docs_url = docs_url
        self.api_url = api_url
        self.setup_routes()

    def setup_routes(self):
        @self.app.get(self.docs_url, response_class=HTMLResponse)
        async def get_documentation_ui():
            return """
            <!DOCTYPE html>
            <html>
            <head>
                <title>AI-Enhanced API Documentation</title>
                <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                <script src="/static/js/custom_docs.js" type="text/babel"></script>
                <link rel="stylesheet" href="/static/css/custom_docs.css">
            </head>
            <body>
                <div id="root"></div>
                <script type="text/babel">
                    ReactDOM.render(<CustomDocs apiUrl="{self.api_url}" />, document.getElementById('root'));
                </script>
            </body>
            </html>
            """

    def get_openapi_schema(self):
        return self.app.openapi()