// ═══════════════════════════════════════════════════════════════
//  Micro:bit AI Classroom — script.js
// ═══════════════════════════════════════════════════════════════

// ── STEP DEFINITIONS ────────────────────────────────────────────
const STEPS = [
  {
    badge: 'STEP 1',
    title: 'Hardware Controls',
    desc: 'Write Python to control the Micro:bit\'s 5×5 LED grid and speaker. Use microbit.draw(x, y, on), microbit.sound(freq, sec), and microbit.clear(). Press A & B for hardware events. Click Run — Pyodide executes your Python live in the browser.',
    view: 'view-hw',
    editorHint: 'Pyodide • runs live in browser',
    runLabel: '▶  Run Code',
    code: `import microbit

# ── STEP 1: HARDWARE CONTROLS ─────────────────────────────────
# Functions you can use:
#   microbit.draw(x, y, True/False)  — toggle an LED at (x, y)
#   microbit.sound(frequency, secs)  — play a tone via Web Audio
#   microbit.clear()                 — turn all LEDs off
#
# Coordinates: (0,0) = top-left,  (4,4) = bottom-right
# Modify this code and click Run to see it on the board!
# ──────────────────────────────────────────────────────────────

microbit.clear()

# Draw a smiley face
eyes  = [(1, 1), (3, 1)]
mouth = [(1, 3), (2, 3), (3, 3)]

for x, y in eyes:
    microbit.draw(x, y, True)

for x, y in mouth:
    microbit.draw(x, y, True)

# Play a cheerful rising arpeggio
microbit.sound(523, 0.12)   # C5
microbit.sound(659, 0.12)   # E5
microbit.sound(784, 0.25)   # G5

print("Smiley drawn on 5x5 LED grid.")
print("Button A → smiley  |  Button B → clear")
print("Try changing the pattern and clicking Run again!")
`
  },
  {
    badge: 'STEP 2',
    title: 'AI Engine Setup',
    desc: 'Configure the Gemma model running on the PyTorch backend. Edit TEMPERATURE, MAX_NEW_TOKENS, and SYSTEM_PROMPT in the code, then click Run — the values are parsed from your code and applied to the live model.',
    view: 'view-config',
    editorHint: 'Edit values → click Run to apply to Gemma',
    runLabel: '▶  Run & Apply Config',
    code: `import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# ── STEP 2: AI ENGINE SETUP ───────────────────────────────────
# Edit the hyperparameters below and click Run.
# Your values will be parsed and sent to the Gemma backend.
# ──────────────────────────────────────────────────────────────

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_PATH = "."   # Local Gemma model files in this project

# Loading happens once at server startup (already done):
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    local_files_only=True,
    torch_dtype=torch.bfloat16,
    low_cpu_mem_usage=True,
)
model.eval()
print(f"Model loaded on: {DEVICE}")

# ── EDIT THESE HYPERPARAMETERS ────────────────────────────────
# Temperature — randomness of output
#   0.1 = Very focused / deterministic
#   0.7 = Balanced (recommended)
#   1.3 = Creative and unpredictable
TEMPERATURE = 0.7

# Maximum tokens the model will generate per reply
MAX_NEW_TOKENS = 200

# System prompt — sets the AI personality and rules
SYSTEM_PROMPT = "You are a helpful AI classroom assistant. Be concise and friendly."

# ─────────────────────────────────────────────────────────────
print(f"Temperature    : {TEMPERATURE}")
print(f"Max new tokens : {MAX_NEW_TOKENS}")
print(f"System prompt  : {SYSTEM_PROMPT[:60]}...")
print("Configuration applied to backend model!")
`
  },
  {
    badge: 'STEP 3',
    title: 'Chatbot Interface',
    desc: 'The premade code below shows exactly how the chat loop works. Click Run to fire a live test message to Gemma and see its reply in the terminal panel. Then type your own messages in the chat.',
    view: 'view-chat',
    editorHint: 'Premade code — click Run to test it live',
    runLabel: '▶  Run Test Message',
    code: `# ── STEP 3: CHATBOT INTERFACE ────────────────────────────────
# The code below is what drives the chat panel on the right.
# Click Run to send a live test message to Gemma!
# Then type your own messages in the chat input.
# ──────────────────────────────────────────────────────────────

import requests

BASE_URL = "http://localhost:5000"
conversation = []   # Stores full chat history for context

def send_message(user_text: str) -> str:
    """
    POST user_text to the Flask backend.
    The backend:
      1. Prepends the system prompt from Step 2
      2. Appends conversation history for multi-turn memory
      3. Runs torch.no_grad() inference with Gemma
      4. Returns the decoded text output
    """
    r = requests.post(f"{BASE_URL}/api/chat", json={
        "message": user_text,
        "history": conversation,
    })
    return r.json()["reply"]

# ── LIVE TEST ─────────────────────────────────────────────────
# This message is sent to Gemma when you click Run:
TEST_MESSAGE = "What is temperature in a language model, in one sentence?"

print(f"Sending: '{TEST_MESSAGE}'")
reply = send_message(TEST_MESSAGE)
print(f"Gemma: {reply}")

conversation.append({"role": "user",      "content": TEST_MESSAGE})
conversation.append({"role": "assistant",  "content": reply})
print("\\nConversation history updated. Chat panel is active!")
`
  },
  {
    badge: 'STEP 4',
    title: 'Function Calling Integration',
    desc: 'The AI acts as an invisible router. Edit test_inputs, click Run — Gemma parses each phrase, selects the matching hardware function, and lights up the LED grid. Then type anything in the chat to route it live.',
    view: 'view-route',
    editorHint: 'Edit test_inputs → click Run to route to hardware',
    runLabel: '▶  Run Function Router',
    code: `# ── STEP 4: FUNCTION CALLING INTEGRATION ─────────────────────
# The AI reads plain English and calls the right hardware
# function. Edit test_inputs and click Run to see it in action!
# ──────────────────────────────────────────────────────────────

import microbit
import requests, json

BASE_URL = "http://localhost:5000"

# Hardware functions the AI can invoke:
def display_pattern(matrix, frequency=440, duration=0.3):
    """Show a 5×5 LED pattern. matrix = list of 25 values (0/1)."""
    microbit.clear()
    for i, v in enumerate(matrix):
        if v: microbit.draw(i % 5, i // 5, True)
    if frequency > 0:
        microbit.sound(frequency, duration)

def play_sound(frequency=440, duration=0.5):
    """Play a tone through the Micro:bit speaker."""
    microbit.sound(frequency, duration)

# ── AI ROUTING ENGINE ─────────────────────────────────────────
def route_to_hardware(user_text):
    print(f"Input   : '{user_text}'")
    r      = requests.post(f"{BASE_URL}/api/route", json={"message": user_text})
    result = r.json()
    action = result["action"]
    method = "Gemma AI" if result.get("ai_used") else "keyword"
    print(f"Router  : {action['function']} via {method}")
    print(f"Pattern : {result.get('pattern', 'custom')}")

    if action["function"] == "displayPattern":
        display_pattern(action.get("matrix", [0]*25),
                        action.get("frequency", 440),
                        action.get("duration", 0.3))
    elif action["function"] == "playSound":
        play_sound(action.get("frequency", 440),
                   action.get("duration", 0.5))
    print()

# ── EDIT THESE TEST INPUTS ────────────────────────────────────
test_inputs = [
    "I am really hungry right now",
    "play me something happy",
    "I feel so sad today",
]

for text in test_inputs:
    route_to_hardware(text)
`
  }
];

// ── STATE ────────────────────────────────────────────────────────
let currentStep = 0;
let pyodide     = null;
let chatHistory3 = [];
let audioCtx    = null;
let isRunning   = false;

// ── LED GRIDS ─────────────────────────────────────────────────────
function buildGrid(containerId) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  const leds = [];
  for (let i = 0; i < 25; i++) {
    const led = document.createElement('div');
    led.className = 'led';
    el.appendChild(led);
    leds.push(led);
  }
  return leds;
}

const ledsMain  = buildGrid('led-grid-main');
const ledsRoute = buildGrid('led-grid-route');

function setLeds(arr, matrix) {
  matrix.forEach((v, i) => { if (i < arr.length) arr[i].classList.toggle('on', !!v); });
}
function clearLeds(arr) { arr.forEach(l => l.classList.remove('on')); }

// ── AUDIO ─────────────────────────────────────────────────────────
function playTone(freq, durSec) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const g   = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.12, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durSec);
    osc.connect(g); g.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + durSec);
  } catch(e) { /* audio blocked — no-op */ }
}

// ── CONSOLE STRIP ─────────────────────────────────────────────────
const consoleEl = document.getElementById('console-strip');
let consoleLines = [];

function consoleClear() {
  consoleLines = [];
  consoleEl.textContent = '>>> Console ready\n';
  consoleEl.classList.add('visible');
}

function consoleLog(text) {
  const lines = String(text).split('\n');
  for (const line of lines) {
    consoleLines.push(line);
    if (consoleLines.length > 80) consoleLines.shift();
  }
  consoleEl.textContent = consoleLines.join('\n');
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

// expose so Pyodide can reach it
window._consoleLog = consoleLog;

// ── PYODIDE INIT ──────────────────────────────────────────────────
async function initPyodide() {
  consoleClear();
  setRunStatus('info', '⏳ Loading Pyodide…');

  try {
    pyodide = await loadPyodide();

    // Micro:bit hardware bridge
    const hardwareAPI = {
      draw:  (x, y, state) => {
        x = parseInt(x); y = parseInt(y);
        if (x < 0 || x > 4 || y < 0 || y > 4) return;
        ledsMain[y * 5 + x].classList.toggle('on', !!state);
        // Also mirror to route grid if on step 4
        if (currentStep === 3) ledsRoute[y * 5 + x].classList.toggle('on', !!state);
      },
      sound: (freq, dur) => playTone(Number(freq), Number(dur)),
      clear: () => { clearLeds(ledsMain); if (currentStep === 3) clearLeds(ledsRoute); },
    };
    pyodide.registerJsModule('microbit', hardwareAPI);

    // Redirect stdout → console strip
    // Also patch time.sleep to be non-blocking in the browser
    pyodide.runPython(`
import sys, time as _t

class _ConsoleOut:
    def write(self, s):
        import js
        if s and s.strip():
            js.window._consoleLog(s.rstrip())
    def flush(self): pass

sys.stdout = _ConsoleOut()
sys.stderr = _ConsoleOut()

# time.sleep blocks the browser thread — make it a no-op
_t.sleep = lambda s: None
`);

    // Make requests available in Pyodide for Steps 3 & 4
    // We can't install real requests in Pyodide, so we inject a mock
    pyodide.runPython(`
import sys, json as _json

class _Response:
    def __init__(self, data): self._data = data
    def json(self): return self._data

class _Requests:
    def post(self, url, json=None, **kw):
        import js
        result = js.window._pyFetch(url, _json.dumps(json or {}))
        return _Response(_json.loads(result))

sys.modules['requests'] = _Requests()
`);

    document.getElementById('btn-run').disabled = false;
    document.getElementById('btn-run').textContent = STEPS[0].runLabel;
    setRunStatus('ok', '✅ Python ready');
    consoleLog('>>> Pyodide loaded — Python is running in your browser!');
    consoleLog('>>> microbit module active  |  requests bridged to backend');
  } catch (err) {
    setRunStatus('err', '❌ Pyodide failed: ' + err.message);
    consoleLog('ERROR: ' + err.message);
  }
}

// Sync fetch bridge: called from Pyodide's requests mock
// Uses XMLHttpRequest so Pyodide can call it synchronously
window._pyFetch = function(url, bodyJson) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, false); // synchronous
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(bodyJson);
    return xhr.responseText;
  } catch(e) {
    return JSON.stringify({ error: e.message, reply: 'Request failed: ' + e.message, success: false });
  }
};

function setRunStatus(cls, text) {
  const el = document.getElementById('run-status');
  el.textContent = text;
  el.className = 'run-status ' + cls;
}

// ── RUN BUTTON DISPATCHER ─────────────────────────────────────────
document.getElementById('btn-run').addEventListener('click', async () => {
  if (isRunning) return;
  const handlers = [runStep1, runStep2, runStep3, runStep4];
  await handlers[currentStep]();
});

// ── STEP 1: Execute in Pyodide ─────────────────────────────────────
async function runStep1() {
  if (!pyodide) { setRunStatus('err', '❌ Pyodide not loaded yet'); return; }
  consoleClear();
  isRunning = true;
  setRunStatus('info', '⏳ Running…');
  const btn = document.getElementById('btn-run');
  btn.disabled = true; btn.textContent = '⏳ Running…';

  const code = document.getElementById('code-editor').value;
  try {
    await pyodide.runPythonAsync(code);
    setRunStatus('ok', '✅ Done');
  } catch (err) {
    const msg = err.message ? err.message.split('\n').slice(-2).join(' ') : String(err);
    consoleLog('ERROR: ' + msg);
    setRunStatus('err', '❌ ' + msg.slice(0, 60));
  } finally {
    isRunning = false;
    btn.disabled = false; btn.textContent = STEPS[0].runLabel;
  }
}

// ── STEP 2: Parse code values → apply to backend ──────────────────
async function runStep2() {
  consoleClear();
  isRunning = true;
  const btn = document.getElementById('btn-run');
  btn.disabled = true; btn.textContent = '⏳ Applying…';
  setRunStatus('info', '⏳ Parsing config…');

  const code = document.getElementById('code-editor').value;

  // Parse values written in the code editor
  const tempM   = code.match(/^TEMPERATURE\s*=\s*([\d.]+)/m);
  const tokM    = code.match(/^MAX_NEW_TOKENS\s*=\s*(\d+)/m);
  const promptM = code.match(/^SYSTEM_PROMPT\s*=\s*["'](.+?)["']/m);

  const temp   = tempM   ? parseFloat(tempM[1])  : parseFloat(document.getElementById('cfg-temp').value);
  const tokens = tokM    ? parseInt(tokM[1])      : parseInt(document.getElementById('cfg-tokens').value);
  const prompt = promptM ? promptM[1]             : document.getElementById('cfg-prompt').value;

  // Sync sliders with parsed values
  document.getElementById('cfg-temp').value   = temp;
  document.getElementById('cfg-temp-val').textContent = temp.toFixed(2);
  document.getElementById('cfg-tokens').value = tokens;
  document.getElementById('cfg-prompt').value = prompt;

  // Simulated execution output (mirrors what the real Python would print)
  consoleLog('>>> Running Step 2 configuration script…');
  consoleLog(`[DEVICE] cuda available: false → using cpu`);
  consoleLog(`[MODEL]  Loading from local path: "."`);
  consoleLog(`[MODEL]  Gemma3ForCausalLM  |  18 layers  |  hidden=640`);
  consoleLog(`[MODEL]  tokenizer: SentencePiece vocab=262144`);
  consoleLog(`[MODEL]  dtype: bfloat16  |  eval mode`);
  await sleep(300);
  consoleLog(`[PARAM]  TEMPERATURE     = ${temp}`);
  consoleLog(`[PARAM]  MAX_NEW_TOKENS  = ${tokens}`);
  consoleLog(`[PARAM]  SYSTEM_PROMPT   = "${prompt.slice(0, 55)}${prompt.length > 55 ? '…' : ''}"`);

  try {
    const res = await fetch('/api/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temperature: temp, max_new_tokens: tokens, system_prompt: prompt }),
    });
    const data = await res.json();
    if (data.success) {
      consoleLog(`[OK]     Configuration applied to live Gemma backend ✓`);
      setRunStatus('ok', `✅ Applied — temp ${temp}, tokens ${tokens}`);
      document.getElementById('cfg-status').textContent = '';
    } else {
      throw new Error('Server error');
    }
  } catch (e) {
    consoleLog('[ERR]    ' + e.message);
    setRunStatus('err', '❌ ' + e.message);
  } finally {
    isRunning = false;
    btn.disabled = false; btn.textContent = STEPS[1].runLabel;
  }
}

// ── STEP 3: Send live test message ────────────────────────────────
async function runStep3() {
  consoleClear();
  isRunning = true;
  const btn = document.getElementById('btn-run');
  btn.disabled = true; btn.textContent = '⏳ Sending…';
  setRunStatus('info', '⏳ Querying model…');

  const code = document.getElementById('code-editor').value;
  const testM = code.match(/TEST_MESSAGE\s*=\s*["'](.+?)["']/);
  const testMsg = testM ? testM[1] : 'What is temperature in a language model, in one sentence?';

  consoleLog('>>> Running Step 3 chatbot script…');
  consoleLog(`[SEND]   "${testMsg}"`);

  appendChatMsg('chat-messages', testMsg, 'user');
  const typing = appendTyping('chat-messages');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: testMsg, history: chatHistory3 }),
    });
    const data = await res.json();
    typing.remove();
    const reply = data.reply || '(no reply)';
    appendChatMsg('chat-messages', reply, 'ai');
    chatHistory3.push({ role: 'user',      content: testMsg });
    chatHistory3.push({ role: 'assistant', content: reply });

    consoleLog(`[GEMMA]  ${reply.slice(0, 120)}${reply.length > 120 ? '…' : ''}`);
    consoleLog('[OK]     Chatbot active — type in the panel →');
    setRunStatus('ok', '✅ Message sent — chat panel active');
  } catch (e) {
    typing.remove();
    consoleLog('[ERR]    ' + e.message + ' (Is the model loaded yet?)');
    setRunStatus('err', '❌ ' + e.message);
    appendChatMsg('chat-messages', '⚠️ Could not reach AI — is the model loaded?', 'ai');
  } finally {
    isRunning = false;
    btn.disabled = false; btn.textContent = STEPS[2].runLabel;
  }
}

// ── STEP 4: Run test_inputs through the router ────────────────────
async function runStep4() {
  consoleClear();
  isRunning = true;
  const btn = document.getElementById('btn-run');
  btn.disabled = true; btn.textContent = '⏳ Routing…';
  setRunStatus('info', '⏳ Running router…');

  const code = document.getElementById('code-editor').value;

  // Extract test_inputs list from code
  const block = code.match(/test_inputs\s*=\s*\[([\s\S]*?)\]/);
  let tests = ['I am really hungry right now', 'play me something happy', 'I feel so sad today'];
  if (block) {
    const found = [...block[1].matchAll(/["']([^"'\n]+)["']/g)].map(m => m[1]);
    if (found.length) tests = found;
  }

  consoleLog('>>> Running Step 4 function calling script…');
  consoleLog(`[INFO]   ${tests.length} test input(s) queued`);
  consoleLog('');

  for (let i = 0; i < tests.length; i++) {
    const text = tests[i];
    consoleLog(`[${i+1}/${tests.length}] Input   : "${text}"`);
    appendChatMsg('route-messages', text, 'user');
    const typing = appendTyping('route-messages');

    try {
      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      typing.remove();

      const action  = data.action;
      const method  = data.ai_used ? 'Gemma AI' : 'keyword';
      const pattern = data.pattern || 'custom';

      consoleLog(`       Router  : ${action.function} via ${method}`);
      consoleLog(`       Pattern : ${pattern}`);

      // Update route-info tag
      const tag   = document.getElementById('route-method-tag');
      const label = document.getElementById('route-pattern-label');
      tag.style.display = 'inline-block';
      tag.className      = 'route-tag ' + (data.ai_used ? 'ai' : 'kw');
      tag.textContent    = data.ai_used ? 'Gemma AI' : 'Keyword';
      label.textContent  = `→ ${pattern}`;

      if (action.function === 'displayPattern' && action.matrix) {
        setLeds(ledsRoute, action.matrix);
        if (action.frequency) playTone(action.frequency, action.duration || 0.3);
        appendChatMsg('route-messages',
          `🤖 <strong>${action.function}</strong> → <em>${pattern}</em> pattern (${method})`, 'ai', true);
      } else if (action.function === 'playSound') {
        playTone(action.frequency || 440, action.duration || 0.5);
        appendChatMsg('route-messages',
          `🔊 <strong>playSound</strong> → ${action.frequency}Hz (${method})`, 'ai', true);
      }

      consoleLog('');
    } catch (e) {
      typing.remove();
      consoleLog(`       ERROR: ${e.message}`);
    }

    if (i < tests.length - 1) await sleep(900);
  }

  consoleLog('[OK]     Router test complete — type in the chat to route live!');
  setRunStatus('ok', '✅ Done — type below to route live');
  isRunning = false;
  btn.disabled = false; btn.textContent = STEPS[3].runLabel;
}

// ── SLEEP HELPER ──────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── STEP NAVIGATION ───────────────────────────────────────────────
const STEP_NAMES = ['Step 1: Hardware','Step 2: AI Engine','Step 3: Chatbot','Step 4: Function Calling'];

function goToStep(n) {
  if (n < 0 || n >= STEPS.length) return;
  currentStep = n;
  const s = STEPS[n];

  document.querySelectorAll('.step-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === n);
    tab.classList.toggle('done',   i < n);
  });

  document.getElementById('step-badge').textContent = s.badge;
  document.getElementById('step-title').textContent = s.title;
  document.getElementById('step-desc').textContent  = s.desc;
  document.getElementById('editor-hint').textContent = s.editorHint;
  document.getElementById('code-editor').value       = s.code;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(s.view).classList.add('active');

  const btn = document.getElementById('btn-run');
  btn.textContent = s.runLabel;
  btn.disabled    = (n === 0 && !pyodide);

  document.getElementById('btn-prev').disabled = n === 0;
  document.getElementById('btn-next').disabled = n === STEPS.length - 1;
  document.getElementById('btn-next').classList.toggle('fwd', n < STEPS.length - 1);
  document.getElementById('nav-step-name').textContent = STEP_NAMES[n];

  consoleClear();
  setRunStatus('', '');

  // Step-specific hints in console
  const hints = [
    '>>> Edit the Python code, then click Run ▶\n>>> The LEDs update live via the microbit bridge.',
    '>>> Edit TEMPERATURE / MAX_NEW_TOKENS / SYSTEM_PROMPT\n>>> Click Run ▶ to parse your values and apply them to Gemma.',
    '>>> Edit TEST_MESSAGE in the code.\n>>> Click Run ▶ to fire a live query at Gemma and see the reply.',
    '>>> Edit test_inputs in the code.\n>>> Click Run ▶ to route each phrase through Gemma to the LED grid.',
  ];
  consoleLog(hints[n]);
}

document.getElementById('btn-prev').addEventListener('click', () => goToStep(currentStep - 1));
document.getElementById('btn-next').addEventListener('click', () => goToStep(currentStep + 1));
document.querySelectorAll('.step-tab').forEach((tab, i) => {
  tab.addEventListener('click', () => goToStep(i));
});

// ── HARDWARE PRESETS ──────────────────────────────────────────────
const PRESETS = {
  smiley:  [0,0,0,0,0, 0,1,0,1,0, 0,0,0,0,0, 1,0,0,0,1, 0,1,1,1,0],
  heart:   [0,1,0,1,0, 1,1,1,1,1, 1,1,1,1,1, 0,1,1,1,0, 0,0,1,0,0],
  x:       new Array(25).fill(0),
  checker: [1,0,1,0,1, 0,1,0,1,0, 1,0,1,0,1, 0,1,0,1,0, 1,0,1,0,1],
  arrow:   [0,0,1,0,0, 0,1,1,1,0, 1,1,1,1,1, 0,1,1,1,0, 0,0,1,0,0],
};
window.loadPreset = function(name) {
  const m = PRESETS[name];
  if (!m) return;
  setLeds(ledsMain, m);
  if (name !== 'x') playTone(440, 0.08);
  consoleLog(`>>> Preset loaded: ${name}`);
};

document.getElementById('hw-btn-a').addEventListener('click', () => {
  playTone(523, 0.1);
  setLeds(ledsMain, PRESETS.smiley);
  consoleLog('>>> Button A pressed → smiley pattern loaded');
});
document.getElementById('hw-btn-b').addEventListener('click', () => {
  playTone(220, 0.1);
  clearLeds(ledsMain);
  consoleLog('>>> Button B pressed → display cleared');
});

// ── AI STATUS POLLING ─────────────────────────────────────────────
function pollAI() {
  fetch('/api/status')
    .then(r => r.json())
    .then(d => {
      const badge = document.getElementById('ai-badge');
      const text  = document.getElementById('ai-badge-text');
      const msTitle = document.getElementById('ms-title');
      const msSub   = document.getElementById('ms-sub');
      const msIcon  = document.getElementById('model-status-box').querySelector('.ms-icon');

      if (d.status === 'ready') {
        badge.className = 'ai-badge ready';
        text.textContent = 'Gemma Ready';
        msIcon.textContent  = '✅';
        msTitle.textContent = 'Model loaded successfully';
        msSub.textContent   = `Device: ${d.device.toUpperCase()}  •  temp ${d.config.temperature}  •  max_tokens ${d.config.max_new_tokens}`;
        document.getElementById('cfg-temp').value        = d.config.temperature;
        document.getElementById('cfg-temp-val').textContent = parseFloat(d.config.temperature).toFixed(2);
        document.getElementById('cfg-tokens').value     = d.config.max_new_tokens;
        document.getElementById('cfg-prompt').value     = d.config.system_prompt;
      } else if (d.status === 'error') {
        badge.className = 'ai-badge error';
        text.textContent = 'AI Error';
        msIcon.textContent  = '❌';
        msTitle.textContent = 'Model load failed';
        msSub.textContent   = d.error || 'Check server logs.';
      } else {
        badge.className = 'ai-badge';
        text.textContent = 'AI Loading…';
        setTimeout(pollAI, 3500);
      }
    })
    .catch(() => setTimeout(pollAI, 5000));
}
pollAI();

// ── CONFIG PANEL SLIDERS ──────────────────────────────────────────
document.getElementById('cfg-temp').addEventListener('input', function () {
  document.getElementById('cfg-temp-val').textContent = parseFloat(this.value).toFixed(2);
});
document.getElementById('btn-apply-cfg').addEventListener('click', async () => {
  const temp   = parseFloat(document.getElementById('cfg-temp').value);
  const tokens = parseInt(document.getElementById('cfg-tokens').value);
  const prompt = document.getElementById('cfg-prompt').value.trim();
  const st = document.getElementById('cfg-status');
  st.className = 'run-status info'; st.textContent = '⏳ Applying…';
  try {
    const res = await fetch('/api/configure', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temperature: temp, max_new_tokens: tokens, system_prompt: prompt }),
    });
    const d = await res.json();
    st.className = 'run-status ok';
    st.textContent = `✅ Applied — temp ${d.config.temperature}, tokens ${d.config.max_new_tokens}`;
  } catch(e) {
    st.className = 'run-status err'; st.textContent = '❌ ' + e.message;
  }
});

// ── CHAT STEP 3 ────────────────────────────────────────────────────
async function sendChat3() {
  const inp = document.getElementById('chat-input-3');
  const msg = inp.value.trim(); if (!msg) return;
  inp.value = '';
  appendChatMsg('chat-messages', msg, 'user');
  const t = appendTyping('chat-messages');
  try {
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: chatHistory3 }),
    });
    const d = await res.json(); t.remove();
    const reply = d.reply || '(no reply)';
    appendChatMsg('chat-messages', reply, 'ai');
    chatHistory3.push({ role: 'user', content: msg });
    chatHistory3.push({ role: 'assistant', content: reply });
    if (chatHistory3.length > 20) chatHistory3 = chatHistory3.slice(-20);
  } catch(e) {
    t.remove(); appendChatMsg('chat-messages', '⚠️ Server error: ' + e.message, 'ai');
  }
}
document.getElementById('chat-send-3').addEventListener('click', sendChat3);
document.getElementById('chat-input-3').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat3(); }
});

// ── CHAT STEP 4 (FUNCTION CALLING) ────────────────────────────────
async function sendRoute() {
  const inp = document.getElementById('chat-input-4');
  const msg = inp.value.trim(); if (!msg) return;
  inp.value = '';
  appendChatMsg('route-messages', msg, 'user');
  const t = appendTyping('route-messages');
  try {
    const res = await fetch('/api/route', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json(); t.remove();
    const action = data.action;
    const method = data.ai_used ? 'Gemma AI' : 'Keyword';
    const pat    = data.pattern || 'custom';

    const tag   = document.getElementById('route-method-tag');
    const label = document.getElementById('route-pattern-label');
    tag.style.display = 'inline-block';
    tag.className = 'route-tag ' + (data.ai_used ? 'ai' : 'kw');
    tag.textContent = data.ai_used ? 'Gemma AI' : 'Keyword';
    label.textContent = `→ ${pat}`;

    if (action.function === 'displayPattern' && action.matrix) {
      setLeds(ledsRoute, action.matrix);
      if (action.frequency) playTone(action.frequency, action.duration || 0.3);
      appendChatMsg('route-messages',
        `🤖 <strong>${action.function}</strong> → <em>${pat}</em> (${method})`, 'ai', true);
    } else if (action.function === 'playSound') {
      playTone(action.frequency || 440, action.duration || 0.5);
      appendChatMsg('route-messages',
        `🔊 <strong>playSound</strong> → ${action.frequency}Hz (${method})`, 'ai', true);
    }
  } catch(e) {
    t.remove(); appendChatMsg('route-messages', '⚠️ ' + e.message, 'ai');
  }
}
document.getElementById('chat-send-4').addEventListener('click', sendRoute);
document.getElementById('chat-input-4').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendRoute(); }
});

// ── CHAT HELPERS ───────────────────────────────────────────────────
function appendChatMsg(cid, text, role, html = false) {
  const wrap = document.getElementById(cid);
  const row  = document.createElement('div');
  row.className = `chat-msg ${role}`;
  const av  = document.createElement('div'); av.className = 'msg-av';
  av.textContent = role === 'user' ? 'You' : 'AI';
  const bub = document.createElement('div'); bub.className = 'msg-bubble';
  if (html) bub.innerHTML = text; else bub.textContent = text;
  row.appendChild(av); row.appendChild(bub);
  wrap.appendChild(row);
  wrap.scrollTop = wrap.scrollHeight;
  return row;
}
function appendTyping(cid) {
  const wrap = document.getElementById(cid);
  const row  = document.createElement('div');
  row.className = 'chat-msg ai';
  row.innerHTML = `<div class="msg-av">AI</div>
    <div class="msg-bubble"><span class="typing-dots"><span></span><span></span><span></span></span></div>`;
  wrap.appendChild(row);
  wrap.scrollTop = wrap.scrollHeight;
  return row;
}

// ── INIT ──────────────────────────────────────────────────────────
goToStep(0);
initPyodide();
