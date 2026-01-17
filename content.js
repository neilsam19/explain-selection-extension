chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_SELECTION") {
    const selection = window.getSelection()?.toString() || "";
    sendResponse({ selection });
  }
  // Return true only if responding async (we're not).
});
