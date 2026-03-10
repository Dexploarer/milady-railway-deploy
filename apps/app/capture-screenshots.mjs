import { chromium } from '@playwright/test';

const SD = '/Users/shawwalters/.gemini/antigravity/brain/c11afaf3-915e-4f07-8ab2-44758735d882';

async function main() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

    console.log('Navigating to app...');
    await page.goto('http://localhost:2138', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // The nav buttons are labeled spans like "Talents", "Knowledge", etc.
    // They are clickable via their parent button elements. 
    // Use force: true to bypass overlay.
    const navLabels = ['Talents', 'Knowledge', 'Channels', 'Plugins', 'Apps', 'Wallets', 'Settings', 'Advanced'];

    for (const label of navLabels) {
        try {
            const el = page.locator(`span.anime-hub-btn-label:has-text("${label}")`).first();
            await el.click({ force: true, timeout: 5000 });
            await page.waitForTimeout(2000);
            await page.screenshot({ path: `${SD}/view_${label.toLowerCase()}.png`, fullPage: false });
            console.log(`✓ Captured: ${label}`);
        } catch (e) {
            // Try with JS click as fallback
            try {
                await page.evaluate((lbl) => {
                    const spans = Array.from(document.querySelectorAll('span'));
                    const span = spans.find(s => s.textContent?.trim().toLowerCase() === lbl.toLowerCase());
                    if (span) {
                        const btn = span.closest('button') || span.parentElement;
                        if (btn) btn.click();
                    }
                }, label);
                await page.waitForTimeout(2000);
                await page.screenshot({ path: `${SD}/view_${label.toLowerCase()}.png`, fullPage: false });
                console.log(`✓ Captured (JS): ${label}`);
            } catch (e2) {
                console.log(`✗ Failed: ${label}: ${e2.message}`);
            }
        }
    }

    // Also try NAV.STREAM and NAV.LIFO
    for (const label of ['Nav.stream', 'Nav.lifo']) {
        try {
            await page.evaluate((lbl) => {
                const spans = Array.from(document.querySelectorAll('span'));
                const span = spans.find(s => s.textContent?.trim().toLowerCase() === lbl.toLowerCase());
                if (span) {
                    const btn = span.closest('button') || span.parentElement;
                    if (btn) btn.click();
                }
            }, label);
            await page.waitForTimeout(2000);
            await page.screenshot({ path: `${SD}/view_${label.toLowerCase().replace('.', '_')}.png`, fullPage: false });
            console.log(`✓ Captured: ${label}`);
        } catch (e) {
            console.log(`✗ Failed: ${label}`);
        }
    }

    await browser.close();
    console.log('Done!');
}

main().catch(e => {
    console.error('Script failed:', e.message);
    process.exit(1);
});
