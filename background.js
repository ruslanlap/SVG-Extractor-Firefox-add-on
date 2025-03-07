
// background.js - Simplified
browser.browserAction.onClicked.addListener((tab) => {
  // Execute content script to find SVGs on the page
  browser.tabs.executeScript(tab.id, {
    file: "content-script.js"
  }).catch(error => {
    console.error(`Error: ${error}`);
  });
});

// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender) => {
  if (message.action === "foundSVGs") {
    // Store SVGs in local storage
    browser.storage.local.set({ 'svgs': message.svgs }).then(() => {
      // Open results page
      browser.tabs.create({
        url: "results.html"
      });
    });
  }
});
