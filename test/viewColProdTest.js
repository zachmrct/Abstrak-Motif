const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

(async function testProductList() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
        await driver.get('http://localhost:3000/login');
        const usernameInput = await driver.findElement(By.id('username'));
        await usernameInput.sendKeys('Max_Verstappen');
        await driver.sleep(2000);

        const passwordInput = await driver.findElement(By.id('password'));
        await passwordInput.sendKeys('12345678');
        await driver.sleep(2000);

        const loginButton = await driver.findElement(By.css('.action-button'));
        await loginButton.click();
        await driver.sleep(2000);

        await driver.wait(until.elementLocated(By.css('.collection-item-container')), 10000);
        await delay(1000);

        let collectionItem = await driver.findElement(By.css('.collection-item-container'));
        await collectionItem.click();

        //verifier if the collection is clicked
        console.log('collection is clicked');
        await delay(1000);
        
        await driver.wait(until.urlContains('/collections/'), 10000);
        await delay(1000);

        //verifier if the collection is opened once clicked
        let productList = await driver.findElements(By.css('.container'));
        if (productList.length > 0) {
            console.log('products inside the collection can now be viewed!');
        } else {
            console.log('the collection did not open, try again.');
        }

    } finally {
        await driver.quit();
    }
})();

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}