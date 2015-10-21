chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({'url': chrome.extension.getURL('app.html'), 'selected': true});
});