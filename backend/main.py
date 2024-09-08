from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from backend.api.routes import router as api_router
from backend.app.custom_docs import CustomDocs
from backend.config import Config

app = FastAPI(title="AI-Enhanced API Documentation")
app.include_router(api_router, prefix="/api")

# Initialize CustomDocs
custom_docs = CustomDocs(app, Config.CUSTOM_DOCS_URL, Config.API_DOCS_URL)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)