/* DeepL adapter for the classic Manifest V3 service worker. No API key required. */
(function () {
  "use strict";

  const ENDPOINT = "https://oneshot-free.www.deepl.com/v1/translate";
  const TARGET_LANGUAGES = { "zh-cn": "zh-Hans", en: "en-US" };
  const MAX_INPUT_LENGTH = 5000;
  const MAX_REQUEST_LENGTH = 1500;
  const TIMEOUT_MS = 20000;

  // Anonymous oneshot requests accept at most 1500 UTF-16 code units.
  // Keep the existing 5000-character input limit by translating in order.
  function splitText(text) {
    const chunks = [];
    while (text.length > MAX_REQUEST_LENGTH) {
      const prefix = text.slice(0, MAX_REQUEST_LENGTH);
      let end = MAX_REQUEST_LENGTH;
      const boundaries = [...prefix.matchAll(/[.!?。！？]\s+|\n+/g)];
      const last = boundaries[boundaries.length - 1];
      const sentenceEnd = last ? last.index + last[0].trimEnd().length : -1;
      const whitespace = prefix.search(/\s+\S*$/);
      if (sentenceEnd >= MAX_REQUEST_LENGTH / 2) end = sentenceEnd;
      else if (whitespace >= MAX_REQUEST_LENGTH / 2) end = whitespace;
      // Never cut between the two halves of an emoji/supplementary character.
      if (/[\uD800-\uDBFF]/.test(text[end - 1])) end--;
      const part = text.slice(0, end);
      text = text.slice(end);
      const separator = text.match(/^\s*/)[0];
      text = text.slice(separator.length);
      chunks.push({ text: part, separator });
    }
    if (text) chunks.push({ text, separator: "" });
    return chunks;
  }

  function isUpgradeNotice(text) {
    // The retired RPC backend returns this multilingual notice as HTTP 200.
    return text.includes("You're using an older version of DeepL.") &&
      text.includes("Sie verwenden eine ältere Version von DeepL.") &&
      text.includes("您正在使用旧版本的 DeepL");
  }

  async function translate(text, targetLang) {
    if (typeof text !== "string") throw new Error("Invalid DeepL text");
    text = text.trim();
    const target = Object.prototype.hasOwnProperty.call(TARGET_LANGUAGES, targetLang)
      ? TARGET_LANGUAGES[targetLang] : null;
    if (!text || text.length > MAX_INPUT_LENGTH || !target) {
      throw new Error("Invalid DeepL text or target language");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      let translated = "";
      for (const chunk of splitText(text)) {
        const response = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "None" },
          credentials: "omit",
          redirect: "error",
          signal: controller.signal,
          body: JSON.stringify({ text: [chunk.text], target_lang: target }),
        });
        if (!response.ok) throw new Error(`DeepL HTTP ${response.status}`);
        const body = await response.json();
        const results = body && body.translations;
        if (!Array.isArray(results) || results.length !== 1 ||
            !results[0] || typeof results[0].text !== "string" ||
            !results[0].text.trim() || isUpgradeNotice(results[0].text)) {
          throw new Error("Invalid DeepL translation response");
        }
        translated += results[0].text + chunk.separator;
      }
      return translated;
    } finally {
      clearTimeout(timeout);
    }
  }

  globalThis.EasyPubMedDeepL = Object.freeze({ translate });
})();
