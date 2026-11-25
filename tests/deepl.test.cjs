const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const background = fs.readFileSync(path.join(root, 'extension/dist/js/background.js'), 'utf8');
const endpoint = 'https://oneshot-free.www.deepl.com/v1/translate';
const upgradeNotice = "You're using an older version of DeepL. To continue using the app, please update to the latest version.\n\nSie verwenden eine ältere Version von DeepL.\n\n您正在使用旧版本的 DeepL。";

// Evaluate the shipped provider, not a separate copy of its implementation.
function loadProvider(fetch, timers = {}) {
  const context = vm.createContext({
    fetch, AbortController, setTimeout, clearTimeout, ...timers,
    j: { a: async (config) => {
      const response = await fetch(config.url, {
        method: config.method, headers: config.headers, body: config.data,
      });
      return { data: await response.json(), status: response.status };
    } },
  });
  context.importScripts = (name) => {
    const file = path.join(root, 'extension/dist/js', name);
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: name });
  };
  const imports = background.match(/^importScripts\([^\n]+\);/);
  if (imports) vm.runInContext(imports[0], context);
  const marker = 'j=(n("8c1a"),n("2dac"));';
  const start = background.indexOf(marker) + marker.length;
  const end = background.indexOf('var Z=n("29b2")', start);
  assert.ok(start >= marker.length && end > start, 'provider anchors exist');
  vm.runInContext(background.slice(start, end) + ';globalThis.provider=q;', context);
  return { translate: context.provider, context };
}

function response(text, status = 200) {
  return { ok: status >= 200 && status < 300, status,
    json: async () => ({ translations: [{ text }] }) };
}

test('uses oneshot instead of displaying the legacy HTTP-200 upgrade notice', async () => {
  const calls = [];
  const { translate } = loadProvider(async (url, init) => {
    calls.push({ url, init });
    if (url.includes('LMT_split_text')) return { status: 200, json: async () => ({
      result: { lang: 'EN', texts: [{ chunks: [{ sentences: [{ text: 'Gene expression.' }] }] }] },
    }) };
    if (url.includes('LMT_handle_jobs')) return { status: 200, json: async () => ({
      result: { translations: [{ beams: [{ sentences: [{ text: upgradeNotice }] }] }] },
    }) };
    assert.equal(url, endpoint);
    return response('基因表达。');
  });
  assert.equal(await translate('Gene expression.', 'zh-cn'), '基因表达。');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.Authorization, 'None');
  assert.equal(calls[0].init.credentials, 'omit');
  assert.deepEqual(JSON.parse(calls[0].init.body), { text: ['Gene expression.'], target_lang: 'zh-Hans' });
});

test('maps English and leaves source language detection to DeepL', async () => {
  const { translate } = loadProvider(async (_, init) => {
    assert.deepEqual(JSON.parse(init.body), { text: ['基因表达。'], target_lang: 'en-US' });
    return response('Gene expression.');
  });
  assert.equal(await translate('  基因表达。  ', 'en'), 'Gene expression.');
});

test('rejects invalid input without sending a request', async () => {
  const { translate } = loadProvider(() => { assert.fail('unexpected network request'); });
  for (const value of ['', '  ', null, 42, 'a'.repeat(5001)]) {
    await assert.rejects(translate(value, 'zh-cn'));
  }
  await assert.rejects(translate('Hello', 'fr'));
});

test('splits long abstracts in order, preserving separators and surrogate pairs', async () => {
  for (const input of [
    'This study examines gene expression. '.repeat(100).trim(),
    'a'.repeat(1499) + '🧬' + 'b'.repeat(1500),
    'a'.repeat(1000) + '\n\n' + 'b'.repeat(1000),
    '基'.repeat(5000),
  ]) {
    let calls = 0;
    const { translate } = loadProvider(async (_, init) => {
      const body = JSON.parse(init.body);
      assert.equal(body.text.length, 1);
      const text = body.text[0];
      assert.ok(text.length > 0 && text.length <= 1500);
      assert.equal(text.isWellFormed(), true);
      calls++;
      return response(text);
    });
    assert.equal(await translate(input, 'zh-cn'), input);
    assert.ok(calls > 1);
  }
});

test('rejects HTTP errors, JSON errors, empty/malformed responses and upgrade notices', async () => {
  const badResponses = [
    response('not a translation', 403), response('not a translation', 429), response('not a translation', 500),
    { ok: true, json: async () => { throw new SyntaxError('invalid JSON'); } },
    { ok: true, json: async () => ({ error: { message: 'unavailable' } }) },
    { ok: true, json: async () => ({ translations: [] }) },
    { ok: true, json: async () => ({ translations: [{ text: 42 }] }) },
    { ok: true, json: async () => ({ translations: [{ text: 'one' }, { text: 'two' }] }) },
    response('  '), response(upgradeNotice),
  ];
  for (const bad of badResponses) {
    const { translate } = loadProvider(async () => bad);
    await assert.rejects(translate('Gene expression.', 'zh-cn'));
  }
});

test('does not return a partial translation when a later chunk fails', async () => {
  let calls = 0;
  const { translate } = loadProvider(async () => ++calls === 1 ? response('first part') : response('', 429));
  await assert.rejects(translate('a'.repeat(3000), 'zh-cn'));
  assert.equal(calls, 2);
});

test('concurrent translations keep their own results and abort signals', async () => {
  const requests = [];
  const { translate } = loadProvider((_, init) => new Promise((resolve) => requests.push({ init, resolve })));
  const first = translate('First abstract', 'zh-cn');
  const second = translate('Second abstract', 'en');
  assert.notEqual(requests[0].init.signal, requests[1].init.signal);
  requests[1].resolve(response('Second result'));
  requests[0].resolve(response('First result'));
  assert.deepEqual(await Promise.all([first, second]), ['First result', 'Second result']);
});

test('releases the timeout on successful and unsuccessful requests', async () => {
  for (const status of [200, 429]) {
    let cleared = false;
    const { translate } = loadProvider(async () => response('译文', status), {
      setTimeout() { return 456; },
      clearTimeout(id) { assert.equal(id, 456); cleared = true; },
    });
    if (status === 200) await translate('Hello', 'zh-cn');
    else await assert.rejects(translate('Hello', 'zh-cn'));
    assert.equal(cleared, true);
  }
});

test('aborts stalled requests and releases the overall timeout', async () => {
  let expire, cleared = false;
  const { translate } = loadProvider((_, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
  }), {
    setTimeout(callback, delay) { assert.equal(delay, 20000); expire = callback; return 123; },
    clearTimeout(id) { assert.equal(id, 123); cleared = true; },
  });
  const pending = translate('Hello', 'zh-cn');
  expire();
  await assert.rejects(pending, /aborted/);
  assert.equal(cleared, true);
});

test('keeps the existing manual/auto translation response contract and fallback', async () => {
  let fail = false;
  const { context } = loadProvider(async () => fail ? response(upgradeNotice) : response('基因表达。'));
  Object.assign(context, {
    s: { b: async () => ({ targetLang: 'zh-cn', translateServiceOrder: ['deepl', 'google'] }), c: async () => {} },
    Ee: { b: { translateServiceOrder: ['deepl', 'google'] } },
    H: { a: class { log() {} } },
    ne: class { async translate() { return { mainMeaning: 'fallback translation' }; } },
  });
  const start = background.indexOf('function Te(e,t){return e.size===t.size');
  const end = background.indexOf('var ke;', start);
  assert.ok(start > 0 && end > start);
  vm.runInContext(background.slice(start, end) + ';globalThis.dispatch=be;', context);
  const result = await context.dispatch('Gene expression.', 'zh-cn', 'deepl');
  assert.equal(result.translateText, '基因表达。');
  assert.equal(result.service, 'deepl');
  assert.equal(result.serviceDisplay, 'DeepL');
  fail = true;
  assert.equal((await context.dispatch('Gene expression.', 'zh-cn', 'deepl')).translateText, 'Error');
  const fallback = await context.dispatch('Gene expression.', 'zh-cn', 'auto');
  assert.equal(fallback.service, 'google');
  assert.equal(fallback.translateText, 'fallback translation');
});

test('ships the adapter as a classic worker dependency with sufficient UI timeout', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'extension/dist/manifest.json'), 'utf8'));
  assert.equal(manifest.background.service_worker, 'js/background.js');
  assert.notEqual(manifest.background.type, 'module');
  assert.equal(manifest.background.module, undefined);
  assert.ok(manifest.host_permissions.includes('*://*.deepl.com/'));
  assert.ok(background.startsWith('importScripts("deepl.js");'));
  assert.equal(background.includes('LMT_handle_jobs'), false);
  const content = fs.readFileSync(path.join(root, 'extension/dist/js/content-script.js'), 'utf8');
  assert.equal(content.includes('async sendWithPromise(t,e,i=5e3,n=2)'), false);
  assert.equal(content.match(/async sendWithPromise\(t,e,i=3e4,n=2\)/g).length, 2);
});
