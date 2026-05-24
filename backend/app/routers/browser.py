"""
ZENITH AI — Browser Operator
Web scraping, form filling, navigation
"""
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from playwright.async_api import async_playwright
import asyncio

router = APIRouter(prefix="/browser", tags=["browser"])

async def scrape_url(url: str) -> dict:
    """Scrape content dari URL"""
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, timeout=15000)
            await page.wait_for_load_state("networkidle", timeout=10000)
            title = await page.title()
            content = await page.inner_text("body")
            await browser.close()
            return {
                "status": "success",
                "title": title,
                "content": content[:3000],
                "url": url
            }
    except Exception as e:
        return {"status": "error", "message": str(e)}

async def search_and_scrape(query: str) -> dict:
    """Search Google dan scrape hasil pertama"""
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(f"https://www.google.com/search?q={query}", timeout=15000)
            await page.wait_for_load_state("networkidle", timeout=10000)
            
            # Ambil hasil pencarian
            results = []
            links = await page.query_selector_all("h3")
            for link in links[:5]:
                text = await link.inner_text()
                if text:
                    results.append(text)
            
            await browser.close()
            return {
                "status": "success",
                "query": query,
                "results": results
            }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/scrape")
async def scrape(request: Request):
    data = await request.json()
    url = data.get("url", "")
    if not url:
        return JSONResponse({"status": "error", "message": "URL diperlukan"})
    result = await scrape_url(url)
    return JSONResponse(result)

@router.post("/search")
async def search(request: Request):
    data = await request.json()
    query = data.get("query", "")
    if not query:
        return JSONResponse({"status": "error", "message": "Query diperlukan"})
    result = await search_and_scrape(query)
    return JSONResponse(result)
