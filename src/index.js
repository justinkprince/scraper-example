const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

// The directory that will hold the saved events.
const dataDir = path.resolve(__dirname, '..', 'data');

(async () => {
  // Launch the browser and go to the target page.
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://headlinerslouisville.com/events/');

  // With evaluate, we can access the DOM of the target page.
  const events = await page.evaluate(() => {

    // Grab all of the event containers.
    const events = document.querySelectorAll('.rhino-event-wrapper');

    // Convert the nodelist into an array of objects with just the data we want.
    return Array.prototype.map.call(events, (event) => {
      // Utility function to grab the element text or an empty string.
      const getElementTextBySelector = (selector, defaultText = '') => {
        const element = event.querySelector(selector);

        return element ? element.innerText : defaultText;
      };

      // The shape of this return object could be anything. Here, we're just querying the DOM for specific
      // element text and using that to build each object we'll store.
      return {
        date: `${getElementTextBySelector('.rhino-event-datebox-month')}/${getElementTextBySelector('.rhino-event-datebox-date')}`,
        headliner: getElementTextBySelector('.rhino-event-header'),
        others: getElementTextBySelector('.rhino-event-subheader'),
        time: getElementTextBySelector('.rhino-event-time'),
        price: getElementTextBySelector('.rhino-event-price'),
      };
    });
  });

  // Create a unique filename to save the data into using a timestamp.
  const filename = `${(new Date()).toISOString()}.json`;
  const filepath = path.resolve(dataDir, filename);
  // Format and serialize the event data.
  const eventsData = JSON.stringify(events, null, 2);

  // Write the data to a JSON file in the data directory.
  fs.writeFile(filepath, eventsData, 'utf8', (err) => {
    if (err) {
      console.log('Could not write to file');
    } else {
      console.log('Saved successfully');
    }
  });

  await browser.close();
})();
