"""
ZENITH AI — Browser Operator
Playwright full browser automation
"""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from playwright.async_api import async_playwright
import httpx
from bs4 import BeautifulSoup

router = APIRouter(prefix="/browser", tags=["browser"])

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

async def scrape_url_playwright(url: str) -> dict:
    """Scrape dengan Playwright — support dynamic JS"""
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, timeout=15000, wait_until="networkidle")
            title = await page.title()
            content = await page.inner_text("body")
            await browser.close()
            return {"status": "success", "title": title, "content": content[:3000], "url": url}
    except Exception as e:
        return await scrape_url_bs(url)

async def scrape_url_bs(url: str) -> dict:
    """Fallback BeautifulSoup"""
    try:
        async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=15) as client:
            res = await client.get(url)
            soup = BeautifulSoup(res.text, "html.parser")
            for tag in soup(["script", "style", "nav", "footer"]):
                tag.decompose()
            title = soup.title.string if soup.title else "No title"
            content = soup.get_text(separator="\n", strip=True)[:3000]
            return {"status": "success", "title": title, "content": content, "url": url}
    except Exception as e:
        return {"status": "error", "message": str(e)}

async def search_web(query: str) -> dict:
    """Search DuckDuckGo"""
    try:
        url = f"https://html.duckduckgo.com/html/?q={query}"
        async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=15) as client:
            res = await client.get(url)
            soup = BeautifulSoup(res.text, "html.parser")
            results = []
            for r in soup.select(".result__body")[:5]:
                title = r.select_one(".result__title")
                snippet = r.select_one(".result__snippet")
                link = r.select_one(".result__url")
                if title and snippet:
                    results.append({
                        "title": title.get_text(strip=True),
                        "snippet": snippet.get_text(strip=True),
                        "url": link.get_text(strip=True) if link else ""
                    })
            return {"status": "success", "query": query, "results": results}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/scrape")
async def scrape(request: Request):
    data = await request.json()
    url = data.get("url", "")
    if not url:
        return JSONResponse({"status": "error", "message": "URL diperlukan"})
    result = await scrape_url_playwright(url)
    return JSONResponse(result)

@router.post("/search")
async def search(request: Request):
    data = await request.json()
    query = data.get("query", "")
    if not query:
        return JSONResponse({"status": "error", "message": "Query diperlukan"})
    result = await search_web(query)
    return JSONResponse(result)
