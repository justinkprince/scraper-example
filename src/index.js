const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

(async () => {
  // Launch the browser and go to the target page.
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://headlinerslouisville.com/events/');

  // Evaluate allows us to run JS in the context of the page, giving us access to its DOM.
  const events = await page.evaluate(() => {
    // Utility function to grab the element text or an empty string.
    const getInnerTextBySelector = (eventNode, selector, defaultText = '') => {
      const element = eventNode.querySelector(selector);

      return element ? element.innerText : defaultText;
    };


    // The shape of this return object could be anything. Here, we're just querying the DOM for specific
    // element text and using that to build each object we'll store.
    const getEventDataFromEventNode = (event) => {
      return {
        date: `${getInnerTextBySelector(event, '.rhino-event-datebox-month')}/${getInnerTextBySelector(event, '.rhino-event-datebox-date')}`,
        headliner: getInnerTextBySelector(event, '.rhino-event-header'),
        others: getInnerTextBySelector(event, '.rhino-event-subheader'),
        time: getInnerTextBySelector(event, '.rhino-event-time'),
        price: getInnerTextBySelector(event, '.rhino-event-price'),
      };
    };

    // Grab all of the event containers.
    const events = document.querySelectorAll('.rhino-event-wrapper');

    // Convert the nodelist into an array of objects with just the data we want.
    return Array.prototype.map.call(events, (event) => getEventDataFromEventNode(event));
  });

  // Create a unique filename to save the data into using a timestamp.
  const filename = `${(new Date()).toISOString()}.json`;
  const filepath = path.join('./data/', filename);
  // Format and serialize the event data.
  const eventsData = JSON.stringify(events, null, 2);

  // Write the data to a JSON file in the data directory.
  fs.writeFile(filepath, eventsData, 'utf8', (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Saved successfully');
    }
  });

  await browser.close();
})();
