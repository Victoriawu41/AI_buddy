// popup.js
document.getElementById('scrapeBtn').addEventListener('click', () => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = ''; // clear previous status

    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs || tabs.length === 0) {
            statusEl.textContent = 'No active tab found.';
            return;
        }
        const tab = tabs[0];

        // Check if the URL starts with the required domain and path
        if (!tab.url || !tab.url.startsWith('https://q.utoronto.ca/courses')) {
            statusEl.textContent =
                'This extension only works on course pages at https://q.utoronto.ca/courses.';
            return;
        }

        // Retrieve extra information from the text area
        const userInfo = document.getElementById('info').value;

        // Send a message to the content script to get the full HTML of the page
        chrome.tabs.sendMessage(tab.id, { action: 'getHtml' }, response => {
            if (chrome.runtime.lastError || !response) {
                // If there's an error (e.g. content script not injected), try injecting the script dynamically.
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tab.id },
                        func: () => document.documentElement.outerHTML
                    },
                    injectionResults => {
                        if (chrome.runtime.lastError) {
                            statusEl.textContent =
                                'Error executing script: ' + chrome.runtime.lastError.message;
                            return;
                        }
                        if (injectionResults && injectionResults[0]) {
                            const fullHtml = injectionResults[0].result;
                            sendData(fullHtml, userInfo, statusEl);
                        } else {
                            statusEl.textContent = 'No result from injected script.';
                        }
                    }
                );
            } else {
                // Use the HTML returned by the content script
                const fullHtml = response.html;
                sendData(fullHtml, userInfo, statusEl);
            }
        });
    });
});

/**
 * Sends the scraped data to the backend endpoint.
 *
 * @param {string} fullHtml - The full HTML of the page.
 * @param {string} userInfo - The extra information from the text area.
 * @param {HTMLElement} statusEl - The DOM element for displaying status messages.
 */
function sendData(fullHtml, userInfo, statusEl) {
    fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ html: fullHtml, info: userInfo })
    })
        .then(response => {
            if (response.ok) {
                statusEl.textContent = 'Scraping and sending data succeeded.';
            } else {
                statusEl.textContent =
                    'Failed to send data. Server responded with status ' + response.status;
            }
        })
        .catch(error => {
            statusEl.textContent = 'Error: ' + error.message;
        });
}
