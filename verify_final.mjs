import { chromium } from "playwright-core";

const EXECUTABLE =
  "C:\\Users\\girib\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe";
const URL = "http://localhost:3000/";

const browser = await chromium.launch({
  executablePath: EXECUTABLE,
  args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (err) => errors.push("PAGEERROR: " + err.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

let pass = 0, fail = 0;
const check = (name, cond) => { if (cond) { pass++; console.log("  ✓", name); } else { fail++; console.log("  ✗", name); } };

await page.goto(URL, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForSelector("canvas", { timeout: 15000 });
await page.waitForTimeout(3000);

const pageText = await page.textContent("body");

// ---- Hero preserved ----
console.log("\n[1] Hero preserved:");
check("has headline", /Stop guessing/i.test(pageText));
check("has 'What Approaches Sees'", pageText.includes("What Approaches Sees"));
check("has pull quote", /best way to predict/i.test(pageText));

// ---- Globe section present & order ----
console.log("\n[2] Globe section:");
check("has 'World Events'", pageText.includes("World Events"));
check("canvas renders", (await page.locator("canvas").count()) >= 1);
const markerMatch = pageText.match(/(\d+) marker/);
check("shows real marker count", markerMatch && parseInt(markerMatch[1]) > 0);
if (markerMatch) console.log("    markers:", markerMatch[0]);

// ---- No fake counters ----
console.log("\n[3] Honesty:");
check("no fake 'live issues' counter", !/\d+\s*live issues/i.test(pageText));
check("no fake '247'", !/247/.test(pageText));

// ---- Category filter ----
console.log("\n[4] Category filter:");
const catBtns = await page.locator("button", { hasText: /Disaster|All/ }).count();
check("has filter buttons", catBtns > 0);

// ---- Marker click → popup ----
console.log("\n[5] Marker click → popup:");
const canvas = await page.locator("canvas");
const box = await canvas.boundingBox();
let popupShown = false;
let popupData = null;
// Dispatch pointermove manually (Playwright mouse.move doesn't emit pointermove
// in this headless chromium; real browsers do).
const dispatchPtr = (type, x, y, btn = 0) =>
  page.evaluate(({ type, x, y, btn }) => {
    const el = document.querySelector("canvas");
    el?.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pageX: x, pageY: y, button: btn, isPrimary: true, pointerId: 1, pressure: type === "pointerup" ? 0 : 0.5, pointerType: "mouse", movementX: 0, movementY: 0 }));
  }, { type, x, y, btn });

const popDeadline = Date.now() + 45000;
for (let py = box.y + 20; py < box.y + box.height - 20 && !popupShown && Date.now() < popDeadline; py += 20) {
  for (let px = box.x + 20; px < box.x + box.width - 20 && !popupShown && Date.now() < popDeadline; px += 20) {
    await dispatchPtr("pointermove", px, py);
    await page.waitForTimeout(45);
    await dispatchPtr("pointerdown", px, py, 0);
    await dispatchPtr("pointerup", px, py, 0);
    await page.waitForTimeout(60);
    if (await page.locator("[role='dialog']").count() > 0) {
      popupShown = true;
      const txt = await page.locator("[role='dialog']").textContent();
      const link = page.locator("[role='dialog'] a");
      popupData = {
        text: txt.replace(/\s+/g, " ").slice(0, 300),
        hasCategory: /Disaster|Politics|Economy|Environment|Health|Science|Society|Conflict|Other/.test(txt),
        hasLocation: /📍/.test(txt),
        hasReadSource: /Read source/.test(txt),
        linkCount: await link.count(),
        linkHref: await link.count() > 0 ? await link.first().getAttribute("href") : null,
        linkTarget: await link.count() > 0 ? await link.first().getAttribute("target") : null,
      };
      // Dismiss
      await dispatchPtr("pointermove", box.x + 5, box.y - 20);
      await page.waitForTimeout(200);
    }
  }
}
check("popup opens on marker click", popupShown);
if (popupData) {
  check("popup has category badge", popupData.hasCategory);
  check("popup has location", popupData.hasLocation);
  check("popup has 'Read source' link", popupData.hasReadSource);
  check("source link has href", !!popupData.linkHref);
  check("source link target=_blank", popupData.linkTarget === "_blank");
  console.log("    popup:", popupData.text.slice(0, 200));
}

// ---- Category filter reduces markers ----
console.log("\n[6] Category filter effect:");
const allBtn = page.locator("button", { hasText: "All" });
const disasterBtn = page.locator("button", { hasText: "Disaster" });
if (await disasterBtn.count() > 0) {
  await disasterBtn.first().click();
  await page.waitForTimeout(1500);
  const afterDisaster = (await page.textContent("body")).match(/(\d+) marker/);
  console.log("    after Disaster filter:", afterDisaster ? afterDisaster[0] : "none");
  if (await allBtn.count() > 0) { await allBtn.first().click(); await page.waitForTimeout(1000); }
}

// ---- Drag rotates (globe is interactive) ----
console.log("\n[7] Drag interaction:");
// We can't easily read rotation, but we can confirm drag doesn't error
const startX = box.x + box.width * 0.4, startY = box.y + box.height * 0.5;
await page.mouse.move(startX, startY);
await page.mouse.down();
await page.mouse.move(startX + 80, startY + 10, { steps: 5 });
await page.mouse.up();
await page.waitForTimeout(300);
check("drag performed without error", errors.length === 0);

// ---- Mobile responsive ----
console.log("\n[8] Mobile responsive:");
await page.setViewportSize({ width: 390, height: 800 });
await page.waitForTimeout(1500);
const mobileText = await page.textContent("body");
check("mobile has 'World Events'", mobileText.includes("World Events"));
check("mobile canvas present", (await page.locator("canvas").count()) >= 1);
const mobileCanvas = await page.locator("canvas");
const mbox = await mobileCanvas.boundingBox();
check("mobile globe fits width", mbox && mbox.width <= 390);

// ---- No API key exposed ----
console.log("\n[9] No secrets exposed:");
const pageSource = await page.content();
check("no API key in page", !/api[_-]?key\s*[:=]\s*["']?[A-Za-z0-9]{20,}/i.test(pageSource));
check("no token in page", !/token\s*[:=]\s*["']?[A-Za-z0-9]{20,}/i.test(pageSource));

// ---- Screenshot ----
await page.setViewportSize({ width: 1280, height: 900 });
await page.waitForTimeout(500);
await page.screenshot({ path: "globe_final.png", fullPage: false });

await browser.close();

console.log("\n=== CONSOLE ERRORS (" + errors.length + ") ===");
errors.forEach((e) => console.log("  ✗", e));
if (errors.length === 0) console.log("  (none)");

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===`);
console.log(fail === 0 && errors.length === 0 ? "PASS" : "FAIL");
