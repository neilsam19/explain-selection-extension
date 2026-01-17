async function explainWithOpenAI({ apiKey, text }) {
  // You can tweak this prompt however you want.
  const prompt = `Explain the following text clearly and concisely.
If it's a single word or phrase, define it and give an example.
If it's a sentence/paragraph, summarize and clarify jargon.

TEXT:
${text}`;

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: prompt,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();

  // Responses API: try to pull the final text safely.
  // Most commonly: data.output_text exists. If not, fallback.
  const answer =
    data.output_text ||
    (data.output?.[0]?.content?.map((c) => c.text).join("") ?? "") ||
    JSON.stringify(data);

  return answer;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "EXPLAIN_TEXT") {
    (async () => {
      try {
        const answer = await explainWithOpenAI({
          apiKey: msg.apiKey,
          text: msg.text,
        });
        sendResponse({ ok: true, answer });
      } catch (e) {
        sendResponse({ ok: false, error: String(e?.message || e) });
      }
    })();

    return true; // keep message channel open for async response
  }
});
