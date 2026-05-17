// ═══════════════════════════════════════════════════════════════
//  Micro:bit AI Classroom — script.js
// ═══════════════════════════════════════════════════════════════

// ── STEP DEFINITIONS ────────────────────────────────────────────
const STEPS = [
  // ── STEP 1: HARDWARE ──────────────────────────────────────────
  {
    badge: 'STEP 1',
    title: 'Hardware Controls',
    desc:  'Write Python to control the Micro:bit\'s 5×5 LED grid and speaker. Your code runs live in the browser via Pyodide.',
    view:  'view-hw',
    editorHint: 'Pyodide • runs live in browser',
    runLabel: '▶  Run Code',

    instructions: `GOAL  Control the Micro:bit's 5×5 LED grid and speaker from Python.

FUNCTIONS AVAILABLE
  microbit.draw(x, y, True)   — light up the LED at column x, row y
  microbit.draw(x, y, False)  — turn it off
  microbit.sound(freq, secs)  — play a tone  (e.g. 440 Hz for 0.2 s)
  microbit.clear()            — turn all 25 LEDs off

COORDINATES   (0,0) = top-left corner     (4,4) = bottom-right

TASK  Clear the display, draw a pattern of your choice, and play at
      least one sound. Click ▶ Run Code to see it on the board.`,

    hint: `How to draw patterns by looping over coordinates:

  positions = [(0,0), (1,1), (2,2), (3,3), (4,4)]
  for x, y in positions:
      microbit.draw(x, y, True)

To draw a full row (e.g. row 2):
  for x in range(5):
      microbit.draw(x, 2, True)

Common note frequencies (Hz):
  C4=262  D4=294  E4=330  F4=349  G4=392  A4=440  C5=523

  microbit.sound(523, 0.2)   # plays C5 for 0.2 seconds`,

    code:
`import microbit

# ── YOUR CODE: Define your LED pattern ───────────────────────
# Add (column, row) pairs — e.g. (2, 2) = centre LED
# Columns and rows both run 0 (left/top) to 4 (right/bottom)

my_pattern = [
    # (x, y),   <-- add coordinates here

]

# ── YOUR CODE: Choose a note frequency in Hz ─────────────────
# C4=262  E4=330  G4=392  A4=440  C5=523  (0 = silent)

my_frequency = 0

# ── PROVIDED: draws your pattern and plays your tone ─────────
microbit.clear()
for x, y in my_pattern:
    microbit.draw(x, y, True)

if my_frequency > 0:
    microbit.sound(my_frequency, 0.3)

print(f"Drew {len(my_pattern)} LEDs at {my_frequency} Hz")
`,
  },

  // ── STEP 2: AI ENGINE ─────────────────────────────────────────
  {
    badge: 'STEP 2',
    title: 'AI Engine Setup',
    desc:  'Configure the Gemma model by writing Python. Define TEMPERATURE, MAX_NEW_TOKENS, and SYSTEM_PROMPT — then click Run to apply them to the live PyTorch backend.',
    view:  'view-config',
    editorHint: 'Edit values in code → click Run to apply',
    runLabel: '▶  Run & Apply Config',

    instructions: `GOAL  Set three PyTorch model config variables, then click ▶ Run.
      Everything else (model loading, inference loop) is provided.

YOUR THREE TASKS

  TEMPERATURE     float 0.0 – 2.0
    Controls how random/creative the model's output is.
    0.1 = very focused    0.7 = balanced    1.3 = creative

  MAX_NEW_TOKENS  integer 10 – 500
    The maximum number of tokens Gemma generates per reply.

  SYSTEM_PROMPT   string
    A sentence describing the AI's personality and rules.
    This is prepended to every conversation as a hidden instruction.

TASK  Replace the placeholder values and click ▶ Run & Apply Config.`,

    hint: `Define the variables as plain Python literals on their own lines:

  TEMPERATURE    = 0.7
  MAX_NEW_TOKENS = 200
  SYSTEM_PROMPT  = "You are a helpful assistant."

Rules:
  • TEMPERATURE must be a float (e.g. 0.7 not just 0)
  • MAX_NEW_TOKENS must be a whole number integer
  • SYSTEM_PROMPT must be a quoted string
  • Avoid expressions — use a plain literal value`,

    code:
`import torch

# ── PROVIDED: The backend already loaded Gemma like this ─────
# model = AutoModelForCausalLM.from_pretrained(".",
#             dtype=torch.bfloat16, low_cpu_mem_usage=True)
# tokenizer = AutoTokenizer.from_pretrained(".")
# model.eval()

# ── YOUR CODE: Set these three generation parameters ─────────

# How random/creative should the output be?  (float 0.0 – 2.0)
TEMPERATURE = 0.0       # <-- replace with e.g. 0.7

# How many tokens can Gemma generate per reply?  (int 10 – 500)
MAX_NEW_TOKENS = 0      # <-- replace with e.g. 200

# What personality/rules should the model follow?  (string)
SYSTEM_PROMPT = ""      # <-- write your own prompt here

# ── PROVIDED: Validates and sends your values to PyTorch ─────
print(f"[torch] dtype         : bfloat16")
print(f"[torch] device        : cpu")
print(f"[param] temperature   : {TEMPERATURE}")
print(f"[param] max_new_tokens: {MAX_NEW_TOKENS}")
print(f"[param] system_prompt : {SYSTEM_PROMPT}")
`,
  },

  // ── STEP 3: CHATBOT ───────────────────────────────────────────
  {
    badge: 'STEP 3',
    title: 'Chatbot Interface',
    desc:  'Complete the send_message() function so it talks to Gemma, then test it by clicking Run. Use the chat panel on the right for a live conversation.',
    view:  'view-chat',
    editorHint: 'Complete the function → click Run to test',
    runLabel: '▶  Run Test Message',

    instructions: `GOAL  Write just two lines inside send_message() to connect your
      code to the Gemma model running on the backend.
      Everything else — imports, function signature, test run — is provided.

YOUR TWO TASKS (inside send_message)

  Line 1 — make the POST request:
    response = requests.post(url, json={"message": ..., "history": ...})

  Line 2 — return just the reply text:
    return response.json()["reply"]

TASK  Fill in the two lines, then click ▶ Run to fire a live test message.
      Afterwards, use the chat panel on the right to have a conversation.`,

    hint: `The two lines you need to write:

  response = requests.post(
      f"{BASE_URL}/api/chat",
      json={"message": user_text, "history": []}
  )
  return response.json()["reply"]

The history list keeps multi-turn context — leave it empty [] for now.`,

    code:
`import requests

# ── PROVIDED: backend address ────────────────────────────────
BASE_URL = "http://localhost:5000"

# ── PROVIDED: function signature and test runner ─────────────
def send_message(user_text):
    # ── YOUR CODE: two lines only ─────────────────────────────
    # Line 1: POST to f"{BASE_URL}/api/chat"
    #         with json={"message": user_text, "history": []}
    # Line 2: return response.json()["reply"]

    response = None  # <-- replace with requests.post(...)
    return None      # <-- replace with the reply string

# ── PROVIDED: sends a test and prints the result ─────────────
TEST_MESSAGE = "In one sentence, what is PyTorch?"

print(f"Sending: '{TEST_MESSAGE}'")
reply = send_message(TEST_MESSAGE)
print(f"Gemma : {reply}")
`,
  },

  // ── STEP 4: FUNCTION CALLING ──────────────────────────────────
  {
    badge: 'STEP 4',
    title: 'Function Calling Integration',
    desc:  'Complete route_to_hardware() to link natural language to the LED grid via the AI router. Edit test_inputs and click Run to see each phrase drive the hardware.',
    view:  'view-route',
    editorHint: 'Complete the function → click Run to route',
    runLabel: '▶  Run Function Router',

    instructions: `GOAL  Write three lines to render an AI-chosen LED pattern on the grid.
      The API call, response parsing, and test loop are all provided.

THE matrix VARIABLE (provided for you)
  A list of 25 values — one per LED, in row-major order.
  Value 1 = LED on,  0 = LED off.

  Index → position:   column = i % 5    row = i // 5

YOUR THREE TASKS (inside the "if displayPattern" block)

  Line 1: microbit.clear()
  Line 2: for i, v in enumerate(matrix):
  Line 3:     if v: microbit.draw(i % 5, i // 5, True)

ALSO: Edit test_inputs to use your own phrases.
TASK  Add the three lines and click ▶ Run Function Router.`,

    hint: `The three lines that render the LED pattern:

  microbit.clear()
  for i, v in enumerate(matrix):
      if v:
          microbit.draw(i % 5, i // 5, True)

i % 5  gives the column (0–4, left to right)
i // 5 gives the row    (0–4, top to bottom)`,

    code:
`import microbit, requests

# ── PROVIDED: backend address ────────────────────────────────
BASE_URL = "http://localhost:5000"

def route_to_hardware(user_text):
    # ── PROVIDED: calls the AI router and gets back an action ──
    result = requests.post(
        f"{BASE_URL}/api/route", json={"message": user_text}
    ).json()
    action = result["action"]
    method = "Gemma AI" if result.get("ai_used") else "keyword"
    print(f"Input  : '{user_text}'")
    print(f"Router : {action['function']} via {method}")

    if action["function"] == "displayPattern":
        matrix = action["matrix"]   # 25 values, 0 or 1

        # ── YOUR CODE: three lines to light up the LEDs ────────
        # Line 1: clear the display
        # Line 2: loop — for i, v in enumerate(matrix):
        # Line 3:     if v: draw the LED at column i%5, row i//5

        pass  # <-- remove this and write your three lines

# ── YOUR CODE: edit these phrases to try different patterns ──
test_inputs = [
    "I am really hungry",    # <-- change these
    "I feel happy today",
    "I am sad",
]

# ── PROVIDED: runs each phrase through the router ────────────
for text in test_inputs:
    route_to_hardware(text)
`,
  },
];

// ── STATE ────────────────────────────────────────────────────────
let currentStep  = 0;
let pyodide      = null;
let chatHistory3 = [];
let audioCtx     = null;
let isRunning    = false;

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
  } catch(e) {}
}

// ── CONSOLE STRIP ─────────────────────────────────────────────────
const consoleEl = document.getElementById('console-strip');
let consoleLines = [];

function consoleClear() {
  consoleLines = ['>>> Console ready'];
  consoleEl.textContent = consoleLines.join('\n');
  consoleEl.scrollTop = 0;
}

function consoleLog(text) {
  String(text).split('\n').forEach(line => {
    consoleLines.push(line);
    if (consoleLines.length > 80) consoleLines.shift();
  });
  consoleEl.textContent = consoleLines.join('\n');
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

window._consoleLog = consoleLog;

// ── PYODIDE INIT ──────────────────────────────────────────────────
async function initPyodide() {
  consoleClear();
  setRunStatus('info', '⏳ Loading Pyodide…');

  try {
    pyodide = await loadPyodide();

    // Micro:bit hardware bridge
    const hardwareAPI = {
      draw: (x, y, state) => {
        x = parseInt(x); y = parseInt(y);
        if (x < 0 || x > 4 || y < 0 || y > 4) return;
        ledsMain[y * 5 + x].classList.toggle('on', !!state);
        if (currentStep === 3) ledsRoute[y * 5 + x].classList.toggle('on', !!state);
      },
      sound: (freq, dur) => playTone(Number(freq), Number(dur)),
      clear: () => { clearLeds(ledsMain); if (currentStep === 3) clearLeds(ledsRoute); },
    };
    pyodide.registerJsModule('microbit', hardwareAPI);

    // Redirect stdout + stderr → console strip, patch time.sleep
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
_t.sleep = lambda s: None   # non-blocking in browser
`);

    // Mock requests module — bridges to Flask backend via XHR
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

// Synchronous XHR bridge for Pyodide → Flask
window._pyFetch = function(url, bodyJson) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, false);
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

// ── HINT BUTTON ───────────────────────────────────────────────────
const hintOverlay = document.getElementById('hint-overlay');
const hintBody    = document.getElementById('hint-body');

document.getElementById('btn-hint').addEventListener('click', () => {
  hintBody.textContent = STEPS[currentStep].hint;
  hintOverlay.classList.add('open');
});
document.getElementById('hint-close').addEventListener('click', () => {
  hintOverlay.classList.remove('open');
});
hintOverlay.addEventListener('click', e => {
  if (e.target === hintOverlay) hintOverlay.classList.remove('open');
});

// ── RUN DISPATCHER ────────────────────────────────────────────────
document.getElementById('btn-run').addEventListener('click', async () => {
  if (isRunning) return;
  await [runStep1, runStep2, runStep3, runStep4][currentStep]();
});

// ── STEP 1: Pyodide execution ──────────────────────────────────────
async function runStep1() {
  if (!pyodide) { setRunStatus('err', '❌ Pyodide not ready'); return; }
  const btn = document.getElementById('btn-run');
  consoleClear();
  isRunning = true;
  btn.disabled = true; btn.textContent = '⏳ Running…';
  setRunStatus('info', '⏳ Running…');

  try {
    await pyodide.runPythonAsync(document.getElementById('code-editor').value);
    setRunStatus('ok', '✅ Done');
  } catch (err) {
    const msg = (err.message || String(err)).split('\n').slice(-2).join(' ');
    consoleLog('ERROR: ' + msg);
    setRunStatus('err', '❌ ' + msg.slice(0, 60));
  } finally {
    isRunning = false;
    btn.disabled = false; btn.textContent = STEPS[0].runLabel;
  }
}

// ── STEP 2: Parse code → apply to backend ─────────────────────────
async function runStep2() {
  const btn = document.getElementById('btn-run');
  consoleClear();
  isRunning = true;
  btn.disabled = true; btn.textContent = '⏳ Applying…';
  setRunStatus('info', '⏳ Parsing config…');

  const code = document.getElementById('code-editor').value;

  // Parse the three variables from the student's code
  const tempM   = code.match(/^TEMPERATURE\s*=\s*([\d.]+)/m);
  const tokM    = code.match(/^MAX_NEW_TOKENS\s*=\s*(\d+)/m);
  const promptM = code.match(/^SYSTEM_PROMPT\s*=\s*["'](.+?)["']/m);

  const cfgStatus = document.getElementById('cfg-status');

  // Validate — all three must be present and non-default
  const errors = [];
  if (!tempM)   errors.push('TEMPERATURE not found or not a plain number');
  if (!tokM)    errors.push('MAX_NEW_TOKENS not found or not an integer');
  if (!promptM) errors.push('SYSTEM_PROMPT not found or not a quoted string');

  const temp   = tempM   ? parseFloat(tempM[1])  : null;
  const tokens = tokM    ? parseInt(tokM[1])      : null;
  const prompt = promptM ? promptM[1]             : null;

  if (tempM   && (temp <= 0 || temp > 2.0))
    errors.push(`TEMPERATURE ${temp} is out of range 0.0–2.0`);
  if (tokM    && (tokens < 10 || tokens > 500))
    errors.push(`MAX_NEW_TOKENS ${tokens} is out of range 10–500`);
  if (promptM && prompt.trim().length < 5)
    errors.push('SYSTEM_PROMPT is too short — write a real description');

  if (errors.length) {
    errors.forEach(e => consoleLog('[ERR]  ' + e));
    setRunStatus('err', '❌ Fix the errors above');
    cfgStatus.className = 'run-status err';
    cfgStatus.textContent = '❌ ' + errors[0];
    isRunning = false;
    btn.disabled = false; btn.textContent = STEPS[1].runLabel;
    return;
  }

  // Simulate the execution output (mirrors what Python would print)
  consoleLog('>>> Running Step 2 configuration script…');
  consoleLog(`[torch]  cuda available: ${false} → device: cpu`);
  consoleLog(`[model]  Gemma3ForCausalLM loaded  (18 layers, hidden=640)`);
  consoleLog(`[tok]    SentencePiece tokenizer  vocab=262144`);
  await sleep(250);
  consoleLog(`[PARAM]  TEMPERATURE    = ${temp}`);
  consoleLog(`[PARAM]  MAX_NEW_TOKENS = ${tokens}`);
  consoleLog(`[PARAM]  SYSTEM_PROMPT  = "${prompt.slice(0, 60)}${prompt.length > 60 ? '…' : ''}"`);

  try {
    const res = await fetch('/api/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temperature: temp, max_new_tokens: tokens, system_prompt: prompt }),
    });
    const data = await res.json();
    if (!data.success) throw new Error('Server rejected config');

    // Update the live display cards
    document.getElementById('live-temp').textContent   = temp;
    document.getElementById('live-tokens').textContent = tokens;
    const lp = document.getElementById('live-prompt');
    lp.textContent  = `"${prompt}"`;
    lp.className    = 'cfg-live-val cfg-live-val--prompt set';

    consoleLog('[OK]   Configuration applied to live Gemma backend ✓');
    setRunStatus('ok', `✅ Applied — temp ${temp}, tokens ${tokens}`);
    cfgStatus.className   = 'run-status ok';
    cfgStatus.textContent = '✅ Config applied to PyTorch backend';
  } catch (e) {
    consoleLog('[ERR]  ' + e.message);
    setRunStatus('err', '❌ ' + e.message);
    cfgStatus.className   = 'run-status err';
    cfgStatus.textContent = '❌ ' + e.message;
  } finally {
    isRunning = false;
    btn.disabled = false; btn.textContent = STEPS[1].runLabel;
  }
}

// ── STEP 3: Run TEST_MESSAGE through the chatbot ──────────────────
async function runStep3() {
  const btn = document.getElementById('btn-run');
  consoleClear();
  isRunning = true;
  btn.disabled = true; btn.textContent = '⏳ Sending…';
  setRunStatus('info', '⏳ Querying model…');

  const code   = document.getElementById('code-editor').value;
  const testM  = code.match(/TEST_MESSAGE\s*=\s*["'](.+?)["']/);
  const testMsg = testM ? testM[1] : 'Hello! Who are you and what can you do?';

  // Check if the student has filled in the function body
  const hasImpl = !/pass\s*$/.test(code.replace(/\s+/g,' ').match(/def send_message[\s\S]*?(?=\n\n|\nTEST)/)?.[0] || '');

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
    if (!hasImpl) consoleLog('[NOTE]   Your send_message() still has "pass" — complete it to make this work from code!');
    consoleLog('[OK]     Chat panel is now active — type in the panel →');
    setRunStatus('ok', '✅ Message sent — chat panel active');
  } catch (e) {
    typing.remove();
    consoleLog('[ERR]    ' + e.message);
    setRunStatus('err', '❌ ' + e.message);
    appendChatMsg('chat-messages', '⚠️ Could not reach backend — is the model loaded?', 'ai');
  } finally {
    isRunning = false;
    btn.disabled = false; btn.textContent = STEPS[2].runLabel;
  }
}

// ── STEP 4: Run test_inputs through the router ────────────────────
async function runStep4() {
  const btn = document.getElementById('btn-run');
  consoleClear();
  isRunning = true;
  btn.disabled = true; btn.textContent = '⏳ Routing…';
  setRunStatus('info', '⏳ Running router…');

  const code = document.getElementById('code-editor').value;

  // Extract test_inputs list from code
  const block = code.match(/test_inputs\s*=\s*\[([\s\S]*?)\]/);
  let tests = ['I am really hungry', 'I feel happy today', 'I am sad'];
  if (block) {
    const found = [...block[1].matchAll(/["']([^"'\n]+)["']/g)].map(m => m[1]);
    if (found.length) tests = found;
  }

  consoleLog('>>> Running Step 4 function calling script…');
  consoleLog(`[INFO]   ${tests.length} test input(s) queued`);
  consoleLog('');

  for (let i = 0; i < tests.length; i++) {
    const text = tests[i];
    consoleLog(`[${i+1}/${tests.length}]  Input   : "${text}"`);
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

      consoleLog(`        Router  : ${action.function} via ${method}`);
      consoleLog(`        Pattern : ${pattern}`);
      consoleLog('');

      const tag   = document.getElementById('route-method-tag');
      const label = document.getElementById('route-pattern-label');
      tag.style.display = 'inline-block';
      tag.className     = 'route-tag ' + (data.ai_used ? 'ai' : 'kw');
      tag.textContent   = data.ai_used ? 'Gemma AI' : 'Keyword';
      label.textContent = `→ ${pattern}`;

      if (action.function === 'displayPattern' && action.matrix) {
        setLeds(ledsRoute, action.matrix);
        if (action.frequency) playTone(action.frequency, action.duration || 0.3);
        appendChatMsg('route-messages',
          `🤖 <strong>${action.function}</strong> → <em>${pattern}</em> (${method})`, 'ai', true);
      } else if (action.function === 'playSound') {
        playTone(action.frequency || 440, action.duration || 0.5);
        appendChatMsg('route-messages',
          `🔊 <strong>playSound</strong> → ${action.frequency}Hz (${method})`, 'ai', true);
      }
    } catch (e) {
      typing.remove();
      consoleLog(`        ERROR: ${e.message}`);
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
const STEP_NAMES = [
  'Step 1: Hardware', 'Step 2: AI Engine',
  'Step 3: Chatbot',  'Step 4: Function Calling'
];

function goToStep(n) {
  if (n < 0 || n >= STEPS.length) return;
  currentStep = n;
  const s = STEPS[n];

  // Tabs
  document.querySelectorAll('.step-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === n);
    tab.classList.toggle('done',   i < n);
  });

  // Banner
  document.getElementById('step-badge').textContent = s.badge;
  document.getElementById('step-title').textContent = s.title;
  document.getElementById('step-desc').textContent  = s.desc;
  document.getElementById('editor-hint').textContent = s.editorHint;

  // Instructions panel — render with highlight spans
  const panel = document.getElementById('instructions-panel');
  panel.textContent = s.instructions;   // set as plain text (pre-wrap in CSS)

  // Code editor
  document.getElementById('code-editor').value = s.code;

  // Views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(s.view).classList.add('active');

  // Run button
  const btn = document.getElementById('btn-run');
  btn.textContent = s.runLabel;
  btn.disabled    = (n === 0 && !pyodide);

  // Nav
  document.getElementById('btn-prev').disabled = n === 0;
  document.getElementById('btn-next').disabled = n === STEPS.length - 1;
  document.getElementById('btn-next').classList.toggle('fwd', n < STEPS.length - 1);
  document.getElementById('nav-step-name').textContent = STEP_NAMES[n];

  consoleClear();
  setRunStatus('', '');

  // Dismiss hint if open
  document.getElementById('hint-overlay').classList.remove('open');
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
  arrow:   [0,0,1,0,0, 0,0,1,1,0, 1,1,1,1,1, 0,0,1,1,0, 0,0,1,0,0],
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
  consoleLog('>>> Button A pressed → smiley pattern');
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
      const badge   = document.getElementById('ai-badge');
      const text    = document.getElementById('ai-badge-text');
      const msTitle = document.getElementById('ms-title');
      const msSub   = document.getElementById('ms-sub');
      const msIcon  = document.getElementById('model-status-box').querySelector('.ms-icon');

      if (d.status === 'ready') {
        badge.className = 'ai-badge ready';
        text.textContent = 'Gemma Ready';
        msIcon.textContent  = '✅';
        msTitle.textContent = 'Model loaded successfully';
        msSub.textContent   = `Device: ${d.device.toUpperCase()}  •  PyTorch inference active`;
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

// ── CHAT STEP 4 ────────────────────────────────────────────────────
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
