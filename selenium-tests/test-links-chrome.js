// For at teste skal dette køres i terminal: node selenium-tests/test-links-chrome.js
// Hvis den virker ser vi "Links er fundet" i konsollen.
// Den er kun lavet for Google Chrome-browseren.

const { Builder, By } = require('selenium-webdriver');

(async () => {
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    // Tester om links findes
    await driver.get("http://127.0.0.1:5501/#/");

    const home = await driver.findElement(By.linkText("Home"));
    const axios = await driver.findElement(By.linkText("Axios Test"));
    const api = await driver.findElement(By.linkText("API Test"));

    console.log("Links er fundet");

  } catch (err) {
    console.error("Fejl i testen:", err);
  } finally {
    await driver.quit();
  }
})();
