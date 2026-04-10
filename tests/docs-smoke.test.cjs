const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = path.resolve(__dirname, "..");
const htmlFiles = ["docs-src/react-19/index.html"];
const themeFiles = ["docs-src/react-19/src/app.css"];
const expectedStrings = ["@stackline/react-google-maps"];
const themeMarker = /stackline-docs-(refresh|wrap-fix|mobile-title-fix|mobile-layout-fix)-2026/;

for (const relativePath of htmlFiles) {
  test(`html smoke: ${relativePath}`, () => {
    const filePath = path.join(repoRoot, relativePath);
    const html = fs.readFileSync(filePath, "utf8");
    assert.match(html, /meta name="viewport"/i);
    assert.match(html, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
    assert.match(html, /googletagmanager\.com\/gtag\/js\?id=G-3KQ9KECXR9/);
    for (const expected of expectedStrings) {
      assert.equal(html.includes(expected), true);
    }
  });
}

for (const relativePath of themeFiles) {
  test(`theme smoke: ${relativePath}`, () => {
    const filePath = path.join(repoRoot, relativePath);
    const source = fs.readFileSync(filePath, "utf8");
    assert.match(source, themeMarker);
  });
}
