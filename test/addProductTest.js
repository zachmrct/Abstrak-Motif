const { Builder, By, Key, until } = require('selenium-webdriver');
const path = require('path');
const axios = require('axios');
const chai = require('chai');
const expect = chai.expect;

async function testProductAddition() {
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

        const collectionItem = await driver.findElement(By.css('.collection-item-container'));
        await collectionItem.click();
        await driver.sleep(2000);

        await driver.wait(until.elementLocated(By.css('.grid-header-add-button')), 5000).click();
        await driver.sleep(1000); 

        // TEST CASE 1: Add Product
        // TEST CASE 2: Name the product with Special Case Letters
        // TEST CASE 3: Input price is non-numeric
        // TEST CASE 4: Input field is missing
        await driver.wait(until.elementLocated(By.css('.add-product-modal')), 5000);
        await driver.sleep(1000); 

        // Note: Change sendKeys('----') upon testing
        await driver.findElement(By.id('product-name-input')).sendKeys('New Product_15'); 
        await driver.sleep(500); 
        await driver.findElement(By.id('product-price-input')).sendKeys('hi');
        await driver.sleep(500); 
        await driver.findElement(By.id('product-sku-input')).sendKeys('SKU12345');
        await driver.sleep(500);  

        await driver.findElement(By.id('material-input')).sendKeys('Cotton', Key.ENTER);
        await driver.sleep(500);  

        const imageInput = await driver.findElement(By.id('imageInput'));
        const directoryPath = './public/uploads/products/';
        const imagePath = path.resolve(directoryPath, 'memories1.png'); // Sample image only and can be changed 
        await imageInput.sendKeys(imagePath);

        await driver.wait(until.elementLocated(By.css('.main-picture img')), 20000);

        await driver.sleep(1000);

        await driver.findElement(By.id('next-form-button')).click();
        await driver.sleep(500);  

        const confirmButton = await driver.findElement(By.css('.swal2-confirm'));
        await confirmButton.click(); 
        await driver.sleep(500);  

        await driver.findElement(By.id('product-price-input')).sendKeys('1250');
        await driver.sleep(500); 
        
        await driver.findElement(By.id('next-form-button')).click();
        await driver.sleep(500);  

        const variationNameInput = await driver.findElement(By.css('.product-form-variation'));
        const variationStockInput = await driver.findElement(By.css('.product-form-stock'));
        const variationManufacturingCostInput = await driver.findElement(By.css('.product-form-manucost'));

        await variationNameInput.sendKeys('Variation 1');
        await driver.sleep(500);  
        await variationStockInput.sendKeys('10');
        await driver.sleep(500);  
        await variationManufacturingCostInput.sendKeys('2000');
        await driver.sleep(500);  

        const addVariation = await driver.findElement(By.css('.add-row-button'));
        await addVariation.click(); 
        await driver.sleep(500);  

        /**TEST CASE 5: Variation must be unique
        const variationInputs = await driver.findElements(By.css('.add-product-variation-row input'));
        const lastVariationInputs = variationInputs.slice(-3);

        await lastVariationInputs[0].sendKeys('Variation 1');
        await driver.sleep(500);  
        await lastVariationInputs[1].sendKeys('20');
        await driver.sleep(500);  
        await lastVariationInputs[2].sendKeys('2500');
        await driver.sleep(500);  

        await driver.findElement(By.id('next-form-button')).click();
        await driver.sleep(500);  

        await confirmButton.click(); 
        await driver.sleep(500);  

        await lastVariationInputs[0].clear();
        await lastVariationInputs[1].clear();
        await lastVariationInputs[2].clear();
        **/
       
        const newVariationInputs = await driver.findElements(By.css('.add-product-variation-row input'));
        const lastNewVariationInputs = newVariationInputs.slice(-3);

        // TEST CASE 6: Variation name with Special case character
        await lastNewVariationInputs[0].sendKeys('-B!');
        await driver.sleep(500);  
        await lastNewVariationInputs[1].sendKeys('10'); 
        await driver.sleep(500);  
        await lastNewVariationInputs[2].sendKeys('3000'); 
        await driver.sleep(500);

        // TEST CASE 7: Delete row from variaton
        const deleteRow = await driver.findElement(By.css('.delete-row-icon'));
        await deleteRow.click(); 

        await driver.findElement(By.id('next-form-button')).click();
        await driver.sleep(500);  

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        if (driver) {
            /*
            (async () => {
                const productName = 'New Product_15'; 
              
                const response = await axios.get(`http://localhost:3000/api/products/name/${productName}`);
              
                const product = response.data;
                console.log(product);
              
                expect(product.name).to.equal('New Product_155');
                expect(product.price).to.equal(1250);
                expect(product.SKU).to.equal('SKU12345');
            })();*/
    
            await driver.quit();
        }

        
    }
}

testProductAddition();
