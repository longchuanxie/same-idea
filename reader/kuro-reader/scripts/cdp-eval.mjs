// 临时 CDP 驱动：Runtime.evaluate 一段 JS 并打印结果
// 用法: node scripts/cdp-eval.mjs '<js-expr>'
const PORT = process.env.CDP_PORT || 9333;

const expr = process.argv[2];
if (!expr) {
  console.error('usage: node scripts/cdp-eval.mjs "<js>"');
  process.exit(1);
}

const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
const page = list.find((p) => p.type === 'page');
if (!page) {
  console.error('no page target');
  process.exit(1);
}

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();

function send(method, params) {
  return new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });
}

const timer = setTimeout(() => {
  console.error('CDP timeout');
  process.exit(1);
}, 20000);

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve } = pending.get(msg.id);
    pending.delete(msg.id);
    resolve(msg);
  }
};

ws.onopen = async () => {
  try {
    const res = await send('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
      userGesture: true,
    });
    clearTimeout(timer);
    if (res.result?.exceptionDetails) {
      console.error('EXCEPTION:', JSON.stringify(res.result.exceptionDetails, null, 2));
    } else {
      console.log(JSON.stringify(res.result?.result?.value, null, 2));
    }
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    ws.close();
    process.exit(0);
  }
};

ws.onerror = (e) => {
  console.error('WS error:', e.message || e);
  process.exit(1);
};
