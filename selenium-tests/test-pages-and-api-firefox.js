// For at teste skal dette køres i terminal: node selenium-tests/test-pages-and-api-firefox.js

const { Builder, By, until } = require('selenium-webdriver');

(async () => {
  const driver = await new Builder().forBrowser('firefox').build();

  try {
    // Tester om webapplikationen åbnes korrekt
    await driver.get('http://127.0.0.1:5501/#/');
    console.log("Webapplikation er åbnet");

    // Tester om app findes
    const appDiv = await driver.findElement(By.id('app'));
    console.log("App container er fundet");

    // Tester om topnav findes
    const topnav = await driver.findElement(By.id('myTopnav'));
    console.log("Topnav er fundet");

    // Tester om footer findes
    const footer = await driver.findElement(By.className('footer'));
    console.log("Footer er fundet, tekst:", await footer.getText());

    // Fører os til Axios Test siden og tester at siden åbnes
    await driver.findElement(By.linkText('Axios Test')).click();
    await driver.sleep(500);
    console.log("Axios page er åbnet");

    // Tester at TestPage wrapper findes
    const testPageWrapper = await driver.findElement(By.css('.default-page-setup'));
    console.log("TestPage wrapper er fundet efter navigation til Axios Test");

    // Tester hvilke h3 elementer der er på siden
    const h3Elements = await driver.findElements(By.css('.default-page-setup h3'));
    for (let i = 0; i < h3Elements.length; i++) {
        const text = await h3Elements[i].getText();
        console.log(`Følgende H3 elementer er fundet: ${i + 1}, ${text}`);
    }

    // Fører os til API Test siden og tester at siden åbnes
    await driver.findElement(By.linkText('API Test')).click();
    await driver.sleep(500);
    console.log("API Page er åbnet");

    // Tester at ApiPage wrapper findes
    const wrapper = await driver.findElement(By.css('.default-page-setup'));
    console.log("Wrapper er fundet");

    // Tester at select og knap findes
    const select = await driver.findElement(By.css('.default-page-setup select'));
    const button = await driver.findElement(By.css('button'));
    console.log("Select og knap er fundet");

    // Tester dropdown options
    const options = await driver.findElements(By.css('select option'));
    console.log("Dropdown options:");
    for (let i = 0; i < options.length; i++) {
        console.log(`  Option #${i + 1}:`, await options[i].getText());
    }

    // Tester "Hent vejr" knap
    await button.click();
    console.log("Klikket på 'Hent vejr'");

    // Tester om loading div vises
    const loadingDiv = await driver.wait(
        until.elementLocated(By.xpath("//div[contains(text(),'Loading weather')]")),
        10000 // vent op til 2 sekunder
    );
    console.log("Loading vises:", await loadingDiv.getText());

    await driver.sleep(1000);

    // Tester om data er indlæst
    const dataParagraphs = await driver.findElements(By.css('.default-page-setup p strong'));
    if (dataParagraphs.length > 0) {
        for (let i = 0; i < dataParagraphs.length; i++) {
            console.log(`Data: ${i + 1},`, await dataParagraphs[i].getText());
        }
    } else {
        console.log("Ingen data tilgængelig endnu");
    }

  } catch (err) {
    console.error("Fejl i testen:", err);
  } finally {
    await driver.quit();
  }
})();
