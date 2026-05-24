"""
ZENITH AI — Web Search Tool
"""
from ddgs import DDGS

async def search_web(query: str, max_results: int = 5) -> str:
    """Search web dan return hasil sebagai string"""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        
        if not results:
            return "Tidak ada hasil ditemukan."
        
        lines = [f"[HASIL PENCARIAN: {query}]"]
        for i, r in enumerate(results, 1):
            lines.append(f"\n{i}. {r.get('title', '')}")
            lines.append(f"   {r.get('body', '')[:200]}")
            lines.append(f"   URL: {r.get('href', '')}")
        
        return "\n".join(lines)
    except Exception as e:
        return f"Error searching: {e}"
