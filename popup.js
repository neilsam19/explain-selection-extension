const apiKeyEl = document.getElementById("apiKey");
const statusEl = document.getElementById("status");
const outputEl = document.getElementById("output");
const manualTextEl = document.getElementById("manualText");

const explainSelectionBtn = document.getElementById("explainSelection");
const explainManualBtn = document.getElementById("explainManual");
const clearBtn = document.getElementById("clear");

function setStatus(text) {
  statusEl.textContent = text;
}

function setOutput(text) {
  outputEl.textContent = text;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function loadApiKey() {
  const { openai_api_key } = await chrome.storage.local.get("openai_api_key");
  if (openai_api_key) apiKeyEl.value = openai_api_key;
}

async function saveApiKey(key) {
  await chrome.storage.local.set({ openai_api_key: key });
}

async function callExplain(text) {
  const apiKey = apiKeyEl.value.trim();
  if (!apiKey) {
    setStatus("Enter your OpenAI API key first.");
    return;
  }
  await saveApiKey(apiKey);

  setStatus("Asking OpenAI…");
  setOutput("");

  const resp = await chrome.runtime.sendMessage({
    type: "EXPLAIN_TEXT",
    apiKey,
    text,
  });

  if (!resp?.ok) {
    setStatus("Error");
    setOutput(resp?.error || "Unknown error");
    return;
  }

  setStatus("Done");
  setOutput(resp.answer);
}

explainSelectionBtn.addEventListener("click", async () => {
  const tab = await getActiveTab();
  const selectionResp = await chrome.tabs.sendMessage(tab.id, {
    type: "GET_SELECTION",
  });
  const selection = selectionResp?.selection?.trim() || "";

  if (!selection) {
    setStatus("No selection found. Highlight text on the page first.");
    return;
  }
  await callExplain(selection);
});

explainManualBtn.addEventListener("click", async () => {
  const text = manualTextEl.value.trim();
  if (!text) {
    setStatus("Type or paste something first.");
    return;
  }
  await callExplain(text);
});

clearBtn.addEventListener("click", () => {
  setStatus("");
  setOutput("");
  manualTextEl.value = "";
});

loadApiKey();
