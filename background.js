function reloadExtensions() {
  // find all unpacked extensions and reload them
  chrome.management.getAll(async function (extensions) {
    for (const ext of extensions) {
      if ((ext.installType === 'development') &&
          (ext.enabled === true) &&
          (ext.name !== 'Extensions Reloader')) {

        const extensionId = ext.id;
        const extensionType = ext.type;

        await chrome.management.setEnabled(extensionId, false);
        await chrome.management.setEnabled(extensionId, true);

        // re-launch packaged app
        if (extensionType === 'packaged_app') {
          chrome.management.launchApp(extensionId);
        }

        console.log(ext.name + ' reloaded');
      }
    }
  });

  // Reload the current tab based on option value
  chrome.storage.sync.get('reloadPage', async function (item) {
    if (!item.reloadPage) { return; }

    const tab = await getCurrentTab();
    if (tab?.id) chrome.tabs.reload(tab.id);
  });

  // show an "OK" badge
  chrome.action.setBadgeText({ text: 'OK' });
  chrome.action.setBadgeBackgroundColor({ color: '#4cb749' });
  setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1000);

}

async function getCurrentTab() {
  return new Promise(function (resolve) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      resolve((tabs.length > 0) ? tabs[0] : null);
    });
  });
}

chrome.action.onClicked.addListener(function (/*tab*/) {
  reloadExtensions();
});
