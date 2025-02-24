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

        const courseHomepageRegex = /^https:\/\/q\.utoronto\.ca\/courses\/\d+$/;

        // Check if the URL starts with the required domain and path
        if (!tab.url || !courseHomepageRegex.test(tab.url)) {
            statusEl.textContent =
                'This extension only works on course homepages (e.g., https://q.utoronto.ca/courses/123456).';
            return;
        }

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
                    sendData(fullHtml, tab.url, statusEl);
                } else {
                    statusEl.textContent = 'No result from injected script.';
                }
            }
        );
    });
});

/**
 * Sends the scraped data to the backend endpoint.
 *
 * @param {string} fullHtml - The full HTML of the page.
 * @param {string} url - The extra information from the text area.
 * @param {HTMLElement} statusEl - The DOM element for displaying status messages.
 */
function sendData(fullHtml, url, statusEl) {
    chrome.runtime.sendMessage({ action: "fetchCookie" }, (response) => {
        if (!response || !response.success) {
            statusEl.textContent = response ? response.error : 'Failed to fetch session cookie.';
            return;
        }

        fetch('http://localhost:8000/course_info/quercus_scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'cookies': response.cookies
            },
            body: JSON.stringify({ 
                html: fullHtml, 
                url: url 
            })
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
    });
}
