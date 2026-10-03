const { Builder, By, until } = require('selenium-webdriver');
const path = require('path');

async function testCollectionAddition() {
    let driver;

    try {
        driver = await new Builder().forBrowser('chrome').build();

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

        const addButton = await driver.findElement(By.css('.grid-header-add-button'));
        await addButton.click();

        await driver.sleep(2000);
        
        // Note: Change sendKeys('----') upon testing
        const nameInput = await driver.findElement(By.id('collection-name-input'));
        await nameInput.sendKeys('New Collection');

        await driver.sleep(2000);

        // Note: Change sendKeys('----') upon testing
        const descriptionInput = await driver.findElement(By.id('collection-description-input'));
        await descriptionInput.sendKeys('Description of the new collection');

        const imageInput = await driver.findElement(By.id('imageInput'));
        const directoryPath = 'public/uploads/collections/';
        const imagePath = path.resolve(directoryPath, 'love_letters.jpg'); // Sample Image (Can be change)
        await imageInput.sendKeys(imagePath);

        await driver.sleep(2000);

        const submitButton = await driver.findElement(By.css('.submit-collection-button'));
        await submitButton.click();

        await driver.wait(until.elementLocated(By.xpath(`//*[text()='New Collection']`)), 5000);

        await driver.sleep(10000);
    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

testCollectionAddition();