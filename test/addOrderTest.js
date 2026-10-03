const { Builder, By, Key, until } = require('selenium-webdriver');
const { Select } = require('selenium-webdriver/lib/select');

async function testOrderAddition() {
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

        const sidebar = await driver.findElement(By.css('.header-menu'));
        await sidebar.click();
        await driver.sleep(2000);
        
        const ordersOption = await driver.findElement(By.css('a[href="/orders"]'));
        await ordersOption.click();
        await driver.sleep(2000);

        await driver.sleep(1000);
        await driver.wait(until.elementLocated(By.css('.grid-header-add-button')), 5000).click();
        await driver.sleep(1000);

        await driver.findElement(By.css('.order-num')).sendKeys('10100');
        await driver.sleep(500);

        const orderFromSelect = await driver.findElement(By.css('.orderedfrom'));
        const orderFromDropdown = new Select(orderFromSelect);
        await orderFromDropdown.selectByValue('In-person');
        await driver.sleep(2000);

        await driver.findElement(By.css('.order-date')).sendKeys('18062024');
        await driver.sleep(500);

        const fulfillmentStatusSelect = await driver.findElement(By.css('.fulfillmentstatus'));
        const fulfillmentStatusDropdown = new Select(fulfillmentStatusSelect);
        await fulfillmentStatusDropdown.selectByValue('Unfulfilled');
        await driver.sleep(2000);

        const paymentMethodSelect = await driver.findElement(By.css('.paymentmethod'));
        const paymentMethodDropdown = new Select(paymentMethodSelect);
        await paymentMethodDropdown.selectByValue('Offline');
        await driver.sleep(2000);

        const paymentStatusSelect = await driver.findElement(By.css('.paymentstatus'));
        const paymentStatusDropdown = new Select(paymentStatusSelect);
        await paymentStatusDropdown.selectByValue('Unpaid');
        await driver.sleep(2000);

        await driver.findElement(By.css('.shipping-fee')).sendKeys('150');
        await driver.sleep(500);

        await driver.findElement(By.css('.voucher')).sendKeys('SUMMER25');
        await driver.sleep(500);

        await driver.findElement(By.id('plus-sign')).click();
        await driver.sleep(500);

        const productContainers = await driver.wait(until.elementsLocated(By.css('.container')), 10000);

        if (productContainers.length >= 2) {
            const firstProductContainer = productContainers[0];
            const firstProductImage = await firstProductContainer.findElement(By.css('.product-pic'));
            await firstProductImage.click();
            await driver.sleep(2000);

            await driver.findElement(By.css('.variations')).click();
            await driver.sleep(1000);

            await driver.findElement(By.css('option[value="L"]')).click();
            await driver.sleep(1000);

            for (let i = 0; i < 4; i++) {
                await driver.findElement(By.css('.plus')).click();
                await driver.sleep(500);
            }

            await driver.findElement(By.css('.add-to-cart')).click();
            await driver.sleep(500);

            await driver.findElement(By.css('.exit-product-details')).click();
            await driver.sleep(1000);

            const secondProductContainer = productContainers[3];
            const secondProductImage = await secondProductContainer.findElement(By.css('.product-pic'));
            await secondProductImage.click();
            await driver.sleep(2000);

            await driver.findElement(By.css('.variations')).click();
            await driver.sleep(1000);

            await driver.findElement(By.css('option[value="C"]')).click();
            await driver.sleep(1000);

            for (let i = 0; i < 10; i++) {
                await driver.findElement(By.css('.plus')).click();
                await driver.sleep(500);
            }

            await driver.findElement(By.css('.add-to-cart')).click();
            await driver.sleep(500);

            await driver.findElement(By.css('.exit-product-details')).click();
            await driver.sleep(1000);

        } else {
            console.error('There are not enough product containers to click the second image.');
        }

        await driver.findElement(By.css('.exit-product-list')).click();
        await driver.sleep(1000);

        await driver.findElement(By.css('.submitbtn')).click();
        await driver.sleep(3000);

        for (let i = 0; i < 4; i++) {
            await driver.findElement(By.id('next-button')).click();
            await driver.sleep(1000);
        }

        await driver.sleep(5000);

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

testOrderAddition();
