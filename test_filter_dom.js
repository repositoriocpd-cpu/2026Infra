const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const defaultContext = browser.contexts()[0];
    const page = defaultContext.pages()[0];

    const firstProcessStatus = await page.evaluate(() => window.state.processes[0].status);
    console.log('First process status (backend data):', firstProcessStatus);
    
    // Select 'Pendente' programmatically to ensure it behaves like user click
    await page.selectOption('#statusFilter', 'Pendente');

    const filterValue = await page.evaluate(() => document.getElementById('statusFilter').value);
    console.log('Status filter dropdown raw value:', filterValue);
    
    await browser.close();
})();
