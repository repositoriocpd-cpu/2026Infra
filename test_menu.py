import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        # open the file
        await page.goto("file:///c:/Users/CPDINFO/Desktop/2025%20Infra%20Sistemas/%27Nova%20Tela%20Gest%C3%A3o%20Infraestrutura%20-%20Copia%27.html")
        
        # Check initial state
        has_open_initial = await page.evaluate("document.getElementById('side-menu').classList.contains('open')")
        print(f"Initial: {has_open_initial}")
        
        # Click menu-toggle
        await page.evaluate("document.getElementById('menu-toggle').click()")
        
        # Check end state
        has_open_end = await page.evaluate("document.getElementById('side-menu').classList.contains('open')")
        print(f"After click: {has_open_end}")
        
        # If open is missing, let's see why
        listeners = await page.evaluate("""
            (function() {
                // If it was clicked, maybe it threw an error?
                return "completed test";
            })()
        """)
        print(listeners)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
