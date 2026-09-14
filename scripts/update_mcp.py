import os
import shutil
import json

# Target MCP directory
target_dir = r"G:\내 드라이브\antigravity\sen-chatbot-v2\aisen_mcp"
client_py = os.path.join(target_dir, "client.py")
server_py = os.path.join(target_dir, "server.py")
init_py = os.path.join(target_dir, "__init__.py")
readme_md = os.path.join(target_dir, "README.md")

# 1. Update client.py
with open(client_py + ".bak", "r", encoding="utf-8") as f:
    client_code = f.read()

old_import = """import json
import logging
from typing import Any, Dict, List, Optional
import httpx"""

new_import = """import json
import logging
import os
from typing import Any, Dict, List, Optional
import httpx"""

client_code = client_code.replace(old_import, new_import, 1)

old_init = """class AisenClient:
    \"\"\"AI-SEN 실서버 API 풀스택 클라이언트\"\"\"

    def __init__(self, base_url: str = DEFAULT_BASE_URL, timeout: float = DEFAULT_TIMEOUT):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout"""

new_init = """# 237종 서울 최적화 기안문 표준 서식 JSON 경로
_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
_TEMPLATES_JSON_PATH = os.path.join(_DATA_DIR, "edufine_templates_seoul.json")


class AisenClient:
    \"\"\"AI-SEN 실서버 API 풀스택 클라이언트\"\"\"

    def __init__(self, base_url: str = DEFAULT_BASE_URL, timeout: float = DEFAULT_TIMEOUT):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._draft_templates_cache: Optional[List[Dict[str, Any]]] = None"""

client_code = client_code.replace(old_init, new_init, 1)

draft_client_methods = """

    # ─────────────────────────────────────────────────────────────
    # 5. K-에듀파인 기안문 공식 표준 서식(237종) 검색 및 인출 (search_draft_templates)
    # ─────────────────────────────────────────────────────────────
    def search_draft_templates(
        self,
        keyword: Optional[str] = None,
        template_no: Optional[int] = None,
        category: Optional[str] = None,
        top_k: int = 3
    ) -> Dict[str, Any]:
        \"\"\"
        서울시교육청 K-에듀파인 237종 공식 표준 기안문 서식 검색 및 규격 본문 인출
        - template_no: 서식 번호 (1~237) 직접 지정 조회
        - keyword: 서식명, 업무명, 본문 키워드 검색
        - category: '교무학사' 또는 '행정' 필터
        - top_k: 반환할 최대 서식 수
        \"\"\"
        if self._draft_templates_cache is None:
            if os.path.exists(_TEMPLATES_JSON_PATH):
                try:
                    with open(_TEMPLATES_JSON_PATH, "r", encoding="utf-8") as f:
                        self._draft_templates_cache = json.load(f)
                except Exception as e:
                    logger.error(f"237종 서식 로드 실패: {e}")
                    self._draft_templates_cache = []
            else:
                self._draft_templates_cache = []

        all_templates = self._draft_templates_cache

        # 1) 번호 직접 조회
        if template_no is not None:
            matched = [t for t in all_templates if t.get("number") == template_no]
            if matched:
                return self._format_draft_templates_result(f"서식 #{template_no}", matched)
            return {"success": False, "error": f"서식 번호 #{template_no}를 찾을 수 없습니다."}

        # 2) 키워드 검색
        if not keyword:
            filtered = all_templates
            if category:
                filtered = [t for t in filtered if t.get("category") == category]
            return self._format_draft_templates_result(category or "전체", filtered[:top_k])

        clean_kw = keyword.strip().lower()
        kw_compact = clean_kw.replace(" ", "")

        scored = []
        for t in all_templates:
            if category and t.get("category") != category:
                continue
            title = t.get("title", "")
            title_compact = title.replace(" ", "").lower()
            sub_cat = t.get("sub_category", "")
            body = t.get("body_template", "")

            score = 0
            if kw_compact == title_compact:
                score += 150
            elif kw_compact in title_compact:
                score += 80
            if kw_compact in sub_cat.replace(" ", "").lower():
                score += 40
            if clean_kw in body.lower():
                score += 20

            if score > 0:
                scored.append((score, t))

        scored.sort(key=lambda x: x[0], reverse=True)
        top_items = [item[1] for item in scored[:top_k]]
        return self._format_draft_templates_result(keyword, top_items)

    def _format_draft_templates_result(self, query_label: str, templates: List[Dict[str, Any]]) -> Dict[str, Any]:
        \"\"\"기안문 서식 검색 결과 및 마크다운 완성문 생성\"\"\"
        if not templates:
            return {
                "success": False,
                "query": query_label,
                "total_found": 0,
                "templates": [],
                "markdown_report": f"⚠️ '{query_label}'에 일치하는 K-에듀파인 기안문 서식을 찾지 못했습니다."
            }

        md_lines = [f"### 📋 '{query_label}' 관련 K-에듀파인 공식 기안문 서식 ({len(templates)}건)\\n"]
        for idx, t in enumerate(templates, 1):
            guide = t.get("original_source_guide", {})
            doc_type = t.get("document_type", "내부결재")
            cat = t.get("category", "")
            sub = t.get("sub_category", "")
            menu_path = guide.get("menu_path", "K-에듀파인 > 문서관리 > 기안 > 샘플서식")

            md_lines.append(f"#### {idx}. [{cat} > {sub}] #{t['number']} {t['title']} (`{doc_type}`)")
            md_lines.append(f"- **에듀파인 경로**: `{menu_path}`")
            md_lines.append("```text")
            md_lines.append(t.get("body_template", "").strip())
            md_lines.append("```\\n")

        return {
            "success": True,
            "query": query_label,
            "total_found": len(templates),
            "templates": templates,
            "markdown_report": "\\n".join(md_lines)
        }
"""

client_code += draft_client_methods

with open(client_py, "w", encoding="utf-8") as f:
    f.write(client_code)
print("1. client.py updated!")

# 2. Update server.py
with open(server_py + ".bak", "r", encoding="utf-8") as f:
    server_code = f.read()

server_tool_func = """

def search_draft_templates(
    keyword: Optional[str] = None,
    template_no: Optional[int] = None,
    category: Optional[str] = None,
    top_k: int = 3
) -> Dict[str, Any]:
    \"\"\"
    서울시교육청 K-에듀파인 공식 표준 기안문 서식(237종 서울 최적화)을 검색하고 규격 본문을 인출합니다.
    
    Args:
        keyword: 검색할 업무명 또는 서식 키워드 (예: "체험학습", "수학여행", "공공요금", "연수", "당직", "기간제", "정수기", "정산")
        template_no: (선택) 공식 서식 번호 직접 지정 (1 ~ 237)
        category: (선택) 분야 필터 ("교무학사", "행정")
        top_k: 반환할 최대 서식 개수 (기본값: 3)
        
    Returns:
        공식 서식 번호, 제목, 문서 구분(내부결재/시행문), 에듀파인 메뉴 경로, 맑은 고딕 12pt 규격 표준 본문(body_template), 마크다운 보고서(markdown_report)
    \"\"\"
    logger.info(f"📋 [search_draft_templates] kw={keyword}, no={template_no}, cat={category}")
    return _client.search_draft_templates(
        keyword=keyword,
        template_no=template_no,
        category=category,
        top_k=top_k
    )
"""

old_tool_register = """if mcp is not None:
    mcp.tool()(search_guidelines)
    mcp.tool()(calculate_travel)
    mcp.tool()(calculate_fuel)
    mcp.tool()(find_forms)"""

new_tool_register = """if mcp is not None:
    mcp.tool()(search_guidelines)
    mcp.tool()(calculate_travel)
    mcp.tool()(calculate_fuel)
    mcp.tool()(find_forms)
    mcp.tool()(search_draft_templates)"""

if old_tool_register in server_code:
    parts = server_code.split(old_tool_register)
    server_code = parts[0] + server_tool_func + "\n" + new_tool_register + parts[1]

with open(server_py, "w", encoding="utf-8") as f:
    f.write(server_code)
print("2. server.py updated!")

# 3. Update __init__.py
with open(init_py + ".bak", "r", encoding="utf-8") as f:
    init_code = f.read()

old_init_server_import = """from .server import (
    search_guidelines,
    calculate_travel,
    calculate_fuel,
    find_forms,
    mcp,
)"""

new_init_server_import = """from .server import (
    search_guidelines,
    calculate_travel,
    calculate_fuel,
    find_forms,
    search_draft_templates,
    mcp,
)"""

init_code = init_code.replace(old_init_server_import, new_init_server_import, 1)

old_init_all = """__all__ = [
    "AisenClient",
    "search_guidelines",
    "calculate_travel",
    "calculate_fuel",
    "find_forms",
    "mcp",
    "DEFAULT_BASE_URL",
]"""

new_init_all = """__all__ = [
    "AisenClient",
    "search_guidelines",
    "calculate_travel",
    "calculate_fuel",
    "find_forms",
    "search_draft_templates",
    "mcp",
    "DEFAULT_BASE_URL",
]"""

init_code = init_code.replace(old_init_all, new_init_all, 1)

with open(init_py, "w", encoding="utf-8") as f:
    f.write(init_code)
print("3. __init__.py updated!")

# 4. Update README.md
if os.path.exists(readme_md):
    with open(readme_md, "r", encoding="utf-8") as f:
        readme_code = f.read()
    
    old_tools_table = """| **`find_forms`** | 75종 이상의 개방형 HWPX/PDF 교육행정·민원 표준 서식 검색 (서버 500 방어 2단계 스마트 폴백 탑재) | `keyword`: "휴직"<br>`top_k`: 3 |"""
    new_tools_table = """| **`find_forms`** | 75종 이상의 개방형 HWPX/PDF 교육행정·민원 표준 서식 검색 (서버 500 방어 2단계 스마트 폴백 탑재) | `keyword`: "휴직"<br>`top_k`: 3 |
| **`search_draft_templates`** | 서울시교육청 **237종 공식 표준 K-에듀파인 기안문 서식** 검색 및 규격 본문(맑은 고딕 12pt, 개조식 정렬) 즉시 인출 | `keyword`: "체험학습"<br>`template_no`: 42<br>`category`: "교무학사" |"""
    
    if old_tools_table in readme_code:
        readme_code = readme_code.replace(old_tools_table, new_tools_table, 1)
        readme_code = readme_code.replace("핵심 4대 도구 (Tools)", "핵심 5대 도구 (Tools)", 1)
        with open(readme_md, "w", encoding="utf-8") as f:
            f.write(readme_code)
        print("4. README.md updated!")

print("ALL MCP UPDATES COMPLETE!")
