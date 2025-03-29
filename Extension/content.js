// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getHtml') {
        sendResponse({ 
            html: document.documentElement.outerHTML,
            url: window.location.href
        });
    }
    // Return true if you plan on sending an asynchronous response
    return false;
});
  