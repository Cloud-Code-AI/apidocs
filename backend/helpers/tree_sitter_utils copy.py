from functools import lru_cache
from tree_sitter import Parser
from tree_sitter_languages import get_language, get_parser
from typing import Dict, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_language(language: str):
    # lang = get_language(language)
    parser = get_parser(language=language)
    return parser

class ParserFactory:
    @staticmethod
    @lru_cache(maxsize=None)
    def get_parser(language: str) -> Parser:
        try:
            return get_parser(language)
        except Exception as e:
            logger.error(f"Failed to create parser for {language}: {str(e)}")
            raise


def traverse_tree(node, code_bytes: bytes) -> Dict[str, Any]:
    if node.type in [
        "function_definition",
        "function_declaration",
        "arrow_function",
        "method_definition",
    ]:
        return {
            "type": "function",
            "name": (
                node.child_by_field_name("name").text.decode("utf8")
                if node.child_by_field_name("name")
                else "anonymous"
            ),
            "code": code_bytes[node.start_byte : node.end_byte].decode("utf8"),
        }
    elif node.type in ["class_definition", "class_declaration"]:
        return {
            "type": "class",
            "name": node.child_by_field_name("name").text.decode("utf8"),
            "code": code_bytes[node.start_byte : node.end_byte].decode("utf8"),
        }
    elif node.type in ["jsx_element", "jsx_self_closing_element"]:
        return {
            "type": "component",
            "name": (
                node.child_by_field_name("opening_element")
                .child_by_field_name("name")
                .text.decode("utf8")
                if node.type == "jsx_element"
                else node.child_by_field_name("name").text.decode("utf8")
            ),
            "code": code_bytes[node.start_byte : node.end_byte].decode("utf8"),
        }
    elif node.type == "impl_item":
        return {
            "type": "impl",
            "name": node.child_by_field_name("type").text.decode("utf8"),
            "code": code_bytes[node.start_byte : node.end_byte].decode("utf8"),
        }
    else:
        return None


def parse_code(code: str, language: str) -> Dict[str, Any]:
    try:
        parser = ParserFactory.get_parser(language)
        tree = parser.parse(bytes(code, "utf8"))
        return traverse_tree(tree.root_node, code.encode("utf8"))
    except Exception as e:
        logger.error(f"Failed to parse {language} code: {str(e)}")
        raise

def check_language_files():
    required_languages = ["python", "javascript", "typescript", "rust"]
    missing_languages = []
    for lang in required_languages:
        try:
            load_language(language=lang)
        except Exception as e:
            logger.warning(f"Failed to load language {lang}: {str(e)}")
            missing_languages.append(lang)

    if missing_languages:
        logger.warning(
            f"Missing or failed to load language files for: {', '.join(missing_languages)}"
        )
    else:
        logger.info("All required language files are present and loaded successfully.")

# Call this function at the start of your application
check_language_files()
