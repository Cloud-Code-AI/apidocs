from fastapi import APIRouter, Depends
from backend.app.ai_engine import AIEngine
from backend.app.documentation_generator import DocumentationGenerator
from backend.app.test_case_generator import TestCaseGenerator
from backend.app.security_analyzer import SecurityAnalyzer
from backend.app.performance_analyzer import PerformanceAnalyzer

router = APIRouter()


@router.post("/enhance_documentation")
async def enhance_documentation(
    api_spec: dict, ai_engine: AIEngine = Depends(AIEngine)
):
    doc_generator = DocumentationGenerator(ai_engine)
    enhanced_docs = await doc_generator.generate(api_spec)
    return {"enhanced_documentation": enhanced_docs}


@router.post("/generate_test_cases")
async def generate_test_cases(
    endpoint_info: dict, ai_engine: AIEngine = Depends(AIEngine)
):
    test_generator = TestCaseGenerator(ai_engine)
    test_cases = await test_generator.generate(endpoint_info)
    return {"test_cases": test_cases}


@router.post("/analyze_security")
async def analyze_security(api_spec: dict):
    security_analyzer = SecurityAnalyzer()
    security_analysis = await security_analyzer.analyze(api_spec)
    return {"security_analysis": security_analysis}


@router.post("/analyze_performance")
async def analyze_performance(api_spec: dict):
    performance_analyzer = PerformanceAnalyzer()
    performance_analysis = await performance_analyzer.analyze(api_spec)
    return {"performance_analysis": performance_analysis}


@router.post("/process_query")
async def process_query(query: str, ai_engine: AIEngine = Depends(AIEngine)):
    response = await ai_engine.process_natural_language_query(query)
    return {"response": response}
