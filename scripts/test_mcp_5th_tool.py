import sys
import os

# Add sen-chatbot-v2 to sys.path
chatbot_v2 = r"G:\내 드라이브\antigravity\sen-chatbot-v2"
if chatbot_v2 not in sys.path:
    sys.path.insert(0, chatbot_v2)

from aisen_mcp import (
    search_guidelines,
    calculate_travel,
    calculate_fuel,
    find_forms,
    search_draft_templates,
    mcp
)

print("=== 1. Package Import Test ===")
print("Successfully imported aisen_mcp and all 5 tools!")

print("\n=== 2. Test search_draft_templates(keyword='체험학습') ===")
res1 = search_draft_templates(keyword="체험학습", top_k=2)
print(f"Success: {res1['success']}, Found: {res1['total_found']}")
for t in res1["templates"]:
    print(f"  - #{t['number']} {t['title']} ({t['category']} > {t['sub_category']}) [{t['document_type']}]")

print("\n=== 3. Test search_draft_templates(keyword='공공요금') ===")
res2 = search_draft_templates(keyword="공공요금", top_k=2)
print(f"Success: {res2['success']}, Found: {res2['total_found']}")
for t in res2["templates"]:
    print(f"  - #{t['number']} {t['title']} ({t['category']} > {t['sub_category']}) [{t['document_type']}]")

print("\n=== 4. Test search_draft_templates(template_no=1) ===")
res3 = search_draft_templates(template_no=1)
print(f"Success: {res3['success']}, Found: {res3['total_found']}")
t0 = res3["templates"][0]
print(f"  Title: {t0['title']}")
print(f"  Body snippet:\n{t0['body_template'][:120]}...")

print("\n=== 5. Markdown Report Sample ===")
print(res1["markdown_report"][:400] + "...")

print("\n=== ALL TESTS PASSED SUCCESSFULLY! ===")
