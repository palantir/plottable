/*eslint-env node */
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

async function run() {
  const root = path.resolve(__dirname, "..");
  const contentTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
  const server = http.createServer((request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    const file = path.resolve(root, "." + decodeURIComponent(pathname));
    if (!file.startsWith(root + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    fs.readFile(file, (error, contents) => {
      if (error) {
        response.writeHead(404).end();
      } else {
        response.setHeader("Content-Type", contentTypes[path.extname(file)] || "application/octet-stream");
        response.end(contents);
      }
    });
  });
  let browser;
  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    browser = await chromium.launch({ channel: process.env.PLOTTABLE_BROWSER_CHANNEL || undefined });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1024 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.stack));
    await page.goto(`http://127.0.0.1:${server.address().port}/test/tests.html`);
    await page.waitForFunction(() => window.mochaResults != null, null, { timeout: 180000 });
    const results = await page.evaluate(() => window.mochaResults);
    for (const failure of results.reports) {
      console.error(failure.titles.concat(failure.name).join(" > ") + "\n" + failure.stack);
    }
    for (const error of errors) {
      console.error(error);
    }
    console.log(`${results.passes} passing, ${results.pending} pending, ${results.failures} failing`);
    if (results.tests === 0 || results.failures > 0 || errors.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
