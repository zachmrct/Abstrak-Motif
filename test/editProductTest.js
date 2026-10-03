const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');

(async function testProductEditForm() {
    const driver = await new Builder().forBrowser('chrome').build();

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

        const collectionItem = await driver.findElement(By.css('.collection-item-container'));
        await collectionItem.click();
        await delay(1000);

        const threeDotsMenu = await driver.wait(until.elementLocated(By.css('.three-dots-product-option')), 10000);
        await threeDotsMenu.click();
        await delay(1000);

        const editOption = await driver.wait(until.elementLocated(By.css('.edit-product')), 10000);
        await editOption.click();
        await delay(1000);

        // 1st page edit forms
        const nameInput = await driver.wait(until.elementLocated(By.id('product-name-input')), 10000);
        await nameInput.clear();
        await nameInput.sendKeys('Letter Services Trucker Capz');
        await delay(1000);

        const pictureInput = await driver.findElement(By.id('imageInput'));
        await pictureInput.sendKeys(__dirname+'/testimages/abg.jpg'); 
        await delay(1000);

        const priceInput = await driver.findElement(By.id('product-price-input'));
        await priceInput.clear();
        await priceInput.sendKeys('550');
        await delay(1000);

        const skuInput = await driver.findElement(By.id('product-sku-input'));
        await skuInput.clear();
        await skuInput.sendKeys('SKU001');
        await delay(1000);

        const materialInput = await driver.findElement(By.id('material-input'));
        const removeMaterial = await driver.findElement(By.css('.remove-material'));
        await removeMaterial.click();
        await delay(1000);
        await materialInput.sendKeys('Wool');
        await materialInput.sendKeys(Key.ENTER); 
        await delay(1000);

        const nextButton = await driver.findElement(By.id('next-form-button'));
        await nextButton.click();
        await delay(1000);

        //note about the product variations id
        //2nd page (b) add variations, currently having problems with the code needs debugging pa
        //manually tested, no bugs

        const deleteRow = await driver.findElement(By.css('.delete-row-icon'));
        await deleteRow.click(); 
        await driver.sleep(500);  

        const deleteAnotherRow = await driver.findElement(By.css('.delete-row-icon'));
        await deleteAnotherRow.click(); 
        await driver.sleep(500);  

        const variationNameInput = await driver.findElement(By.css('.product-form-variation'));
         await variationNameInput.clear();
         await variationNameInput.sendKeys('One Size');
         await driver.sleep(500);  

        const newStockInput = await driver.findElement(By.css('.product-form-stock'));
        await newStockInput.clear();
        await newStockInput.sendKeys('30');
        await driver.sleep(500);  

        const newCostInput = await driver.findElement(By.css('.product-form-manucost'));
        await newCostInput.clear();
        await newCostInput.sendKeys('100');
        await driver.sleep(500);  


        await driver.findElement(By.id('next-form-button')).click();
        await driver.sleep(500);  

        // verifier
        console.log('product edit form test passed');
    } catch (error) {
        console.error('product edit form test failed:', error);
    } finally {
        await driver.quit();
    }
}) ();

//testProductEditForm();
async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}