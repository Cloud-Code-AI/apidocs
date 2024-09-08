from fastapi import APIRouter, Body
from backend.app.analyze_repo import CodebaseAnalyzer
from pydantic import BaseModel
import json
from fastapi import FastAPI, Request, BackgroundTasks, HTTPException
from fastapi.responses import JSONResponse
from backend.api.help import process_updates
router = APIRouter()

class DocumentationRequest(BaseModel):
    url: str

@router.post("/generate_documentation")
async def generate_documentation(
    request: DocumentationRequest = Body(...)
):
    url = request.url.replace(".git", "")
    analyzer = CodebaseAnalyzer(repo_path=url)
    api_spec = analyzer.analyze()
    file_name = request.url.split("/")[-1].replace('.git', '').replace('/', '_') + '.json'
    with open("static/" + file_name, "w") as f:
        json.dump(api_spec, f, indent=4)
    return {"api_spec": api_spec}


@router.post("/github-webhook")
async def handle_webhook(request: Request, background_tasks: BackgroundTasks):
    payload = await request.json()
    body = await request.body()
    event = request.headers.get("X-GitHub-Event", "missing_event")
    if event == "pull_request":
        repo_name = payload["repository"]["full_name"]
        background_tasks.add_task(process_updates, f'https://github.com/{repo_name}')

    return JSONResponse(content={"message": "Webhook received"})


# @router.post("/generate_test_cases")
# async def generate_test_cases(
#     endpoint_info: dict, ai_engine: AIEngine = Depends(AIEngine)
# ):
#     test_generator = TestCaseGenerator(ai_engine)
#     test_cases = await test_generator.generate(endpoint_info)
#     return {"test_cases": test_cases}


# @router.post("/analyze_security")
# async def analyze_security(api_spec: dict):
#     security_analyzer = SecurityAnalyzer()
#     security_analysis = await security_analyzer.analyze(api_spec)
#     return {"security_analysis": security_analysis}


# @router.post("/analyze_performance")
# async def analyze_performance(api_spec: dict):
#     performance_analyzer = PerformanceAnalyzer()
#     performance_analysis = await performance_analyzer.analyze(api_spec)
#     return {"performance_analysis": performance_analysis}


# @router.post("/process_query")
# async def process_query(query: str, ai_engine: AIEngine = Depends(AIEngine)):
#     response = await ai_engine.process_natural_language_query(query)
#     return {"response": response}
