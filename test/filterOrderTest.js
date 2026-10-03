const { Builder, By, until } = require('selenium-webdriver');
const { Select } = require('selenium-webdriver/lib/select');

async function testFilterOrder() {
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

        const startDateInput = await driver.findElement(By.id('start-date'));
        const endDateInput = await driver.findElement(By.id('end-date'));
        const sortingSelect = await driver.findElement(By.id('sorting'));
        const fulfillmentSelect = await driver.findElement(By.id('fulfillmentfilter'));
        const orderFromSelect = await driver.findElement(By.id('orderfromfilter'));
        const paymentStatusSelect = await driver.findElement(By.id('paymentstatusfilter'));
        const clearButton = await driver.findElement(By.css('.filter-sort-clear'));
        const doneButton = await driver.findElement(By.css('.filter-sort-done'));

        const testCases = [
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'ordernumascending',
                fulfillmentOption: 'Fulfilled',
                orderFromOption: 'WIX website',
                paymentStatusOption: 'Paid'
            },
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'ordernumdescending',
                fulfillmentOption: 'Fulfilled',
                orderFromOption: 'WIX website',
                paymentStatusOption: 'Paid'
            },
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'orderdatelatest',
                fulfillmentOption: 'Fulfilled',
                orderFromOption: 'WIX website',
                paymentStatusOption: 'Paid'
            },
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'orderdateearliest',
                fulfillmentOption: 'Fulfilled',
                orderFromOption: 'WIX website',
                paymentStatusOption: 'Paid'
            },
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'ordernumascending',
                fulfillmentOption: 'Unfulfilled',
                orderFromOption: 'WIX website',
                paymentStatusOption: ''
            },
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'ordernumdescending',
                fulfillmentOption: 'Unfulfilled',
                orderFromOption: 'WIX website',
                paymentStatusOption: ''
            },
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'orderdatelatest',
                fulfillmentOption: 'Unfulfilled',
                orderFromOption: 'WIX website',
                paymentStatusOption: ''
            },
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'orderdateearliest',
                fulfillmentOption: 'Unfulfilled',
                orderFromOption: 'WIX website',
                paymentStatusOption: ''
            },
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'orderdateearliest',
                fulfillmentOption: 'Fulfilled',
                orderFromOption: 'Private Message',
                paymentStatusOption: 'Paid'
            },
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'orderdateearliest',
                fulfillmentOption: 'Fulfilled',
                orderFromOption: 'In-person',
                paymentStatusOption: 'Paid'
            },
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'ordernumascending',
                fulfillmentOption: 'Fulfilled',
                orderFromOption: 'WIX website',
                paymentStatusOption: 'Unpaid'
            },
            {
                startDate: '01-01-2024',
                endDate: '01-04-2024',
                sortingOption: 'ordernumdescending',
                fulfillmentOption: 'Fulfilled',
                orderFromOption: 'WIX website',
                paymentStatusOption: 'Unpaid'
            },
        ];

        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];

            const filterBttn = await driver.findElement(By.css('.filter-sort'));
            await filterBttn.click();
            await driver.sleep(1000);
            await startDateInput.sendKeys(testCase.startDate);
            await endDateInput.sendKeys(testCase.endDate);
            await driver.sleep(1000);

            const sortingDropdown = new Select(sortingSelect);
            await sortingDropdown.selectByValue(testCase.sortingOption);
            await driver.sleep(1000);

            const fulfillmentDropdown = new Select(fulfillmentSelect);
            await fulfillmentDropdown.selectByValue(testCase.fulfillmentOption);
            await driver.sleep(1000);

            const orderFromDropdown = new Select(orderFromSelect);
            await orderFromDropdown.selectByValue(testCase.orderFromOption);
            await driver.sleep(1000);

            const paymentStatusDropdown = new Select(paymentStatusSelect);
            await paymentStatusDropdown.selectByValue(testCase.paymentStatusOption);
            await driver.sleep(1000);

        const confirm = await driver.findElement(By.css('.filter-sort-done'));
        await confirm.click();
        await driver.sleep(1000);
        }

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
        if (driver) {
            await driver.quit();
        }
    }
}

testFilterOrder();
