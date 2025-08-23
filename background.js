chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    isRunning: false,
    applicationCount: 0,
    skillFrequency: {}
  });
});
