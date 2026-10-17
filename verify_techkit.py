import os
from playwright.sync_api import sync_playwright

os.makedirs("/home/jules/verification/videos", exist_ok=True)
os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

def run_cuj(page):
    # Navigate to app
    page.goto("http://localhost:5173")
    page.wait_for_timeout(1000)

    # Click on "Sistema y Hardware" or "Especificaciones" category to see GPU/Hardware
    page.get_by_text("Especificaciones del Equipo").click()
    page.wait_for_timeout(1500)

    # Click on "Catálogo de Herramientas Externas"
    page.get_by_text("Catálogo de Herramientas Externas").click()
    page.wait_for_timeout(1500)

    # Click on "Sitio Oficial" button on HWiNFO64
    page.get_by_role("button", name="Sitio Oficial").first.click()
    page.wait_for_timeout(1000)

    # Take screenshot at the final state
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
