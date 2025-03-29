chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fetchCookie") {
        chrome.cookies.getAll({ url: "http://localhost:5173" }, (cookies) => {
            if (cookies) {
                sendResponse({ success: true, cookies: cookies });
            } else {
                sendResponse({ success: false, error: "No session cookie found" });
            }
        });
        return true; // Indicates that the response is asynchronous
    }
});