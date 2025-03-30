// popup.js

// Fetch syllabus files and populate dropdown when popup opens
document.addEventListener('DOMContentLoaded', () => {
    populateSyllabusDropdown();
});

// Function to populate the syllabus dropdown
function populateSyllabusDropdown() {
    const dropdown = document.getElementById('syllabusFileName');
    const statusEl = document.getElementById('status');
    
    // Show loading message in the dropdown
    dropdown.innerHTML = '<option value="">Loading syllabus files...</option>';
    
    // First fetch the authentication cookie
    chrome.runtime.sendMessage({ action: "fetchCookie" }, (response) => {
        if (!response || !response.success) {
            dropdown.innerHTML = '<option value="">Authentication error</option>';
            statusEl.textContent = response ? response.error : 'Failed to fetch session cookie.';
            return;
        }
        
        // Then make the API call with the cookie
        fetch('http://localhost:8000/quercus_scrape/syllabus_files', {
            headers: {
                'cookies': response.cookies
            }
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 401) {
                        dropdown.innerHTML = '<option value="">Authentication required</option>';
                        statusEl.textContent = 'Please log in at ';
                        
                        const link = document.createElement('a');
                        link.href = 'http://localhost:5173';
                        link.textContent = 'http://localhost:5173';
                        link.target = '_blank'; // Open in new tab
                        
                        // Append the link to status element
                        statusEl.appendChild(link);
                        return null;
                    }
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (!data) return; // If data is null (due to 401), exit early
                
                // Clear the dropdown
                dropdown.innerHTML = '<option value="">Select a syllabus file...</option>';
                
                // Extract the pdf_files array from the response
                const files = data.pdf_files;
                
                if (Array.isArray(files)) {
                    // Add each file as an option
                    files.forEach(file => {
                        const option = document.createElement('option');
                        option.value = file;
                        option.textContent = file;
                        dropdown.appendChild(option);
                    });
                    
                    if (files.length === 0) {
                        dropdown.innerHTML = '<option value="">No syllabus files available</option>';
                    }
                } else {
                    console.error('Expected pdf_files array but received:', data);
                    dropdown.innerHTML = '<option value="">Error: Invalid response format</option>';
                }
            })
            .catch(error => {
                console.error('Error fetching syllabus files:', error);
                dropdown.innerHTML = '<option value="">Error loading files</option>';
                statusEl.textContent = `Failed to load syllabus files: ${error.message}`;
            });
    });
}

document.getElementById('scrapeBtn').addEventListener('click', () => {
    const statusEl = document.getElementById('status');
    statusEl.textContent = ''; // clear previous status

    // Get the syllabus file name from the dropdown
    const syllabusFileName = document.getElementById('syllabusFileName').value;
    
    // Check if a syllabus file was selected
    if (!syllabusFileName) {
        statusEl.textContent = 'Error: Please select a syllabus file before proceeding.';
        return;
    }
    
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

        // Get the selected syllabus file name from the dropdown
        const syllabusFileName = document.getElementById('syllabusFileName').value || '';

        fetch('http://localhost:8000/quercus_scrape/quercus_scrape', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'cookies': response.cookies
            },
            body: JSON.stringify({ 
                html: fullHtml, 
                url: url,
                syllabus_file_name: syllabusFileName
            })
        })
        .then(response => {
            if (response.ok) {
                statusEl.textContent = 'Scraping and sending data succeeded.';
            } else if (response.status === 401) {
                statusEl.textContent = 'Failed to send data. Please log in at ';

                const link = document.createElement('a');
                link.href = 'http://localhost:5173';
                link.textContent = 'http://localhost:5173';
                link.target = '_blank'; // Open in new tab
                
                // Append the link to status element
                statusEl.appendChild(link);
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
