// ═══════════════════════════════════════════════════════════════
//  Micro:bit AI Classroom — script.js
// ═══════════════════════════════════════════════════════════════

// ── STEP DEFINITIONS ────────────────────────────────────────────
const STEPS = [
  {
    badge: 'STEP 1',
    title: 'Hardware Controls',
    desc: 'Write Python to control the Micro:bit\'s 5×5 LED grid and speaker. Use microbit.draw(x, y, on), microbit.sound(freq, sec), and microbit.clear(). Press A & B for hardware events. Runs live in the browser via Pyodide.',
    view: 'view-hw',
    editorHint: 'Pyodide • runs in browser',
    runLabel: 'Run Code ▶',
    code: `import microbit
import time

# ── STEP 1: HARDWARE CONTROLS ─────────────────────────────────
# Available functions:
#   microbit.draw(x, y, True/False)  — control individual LED
#   microbit.sound(frequency, secs)  — play a tone
#   microbit.clear()                 — turn all LEDs off
#
# The x, y coordinates go from (0,0) top-left to (4,4) bottom-right
# Try modifying this pattern and clicking Run!
# ──────────────────────────────────────────────────────────────

microbit.clear()

# Draw a smiley face
eyes  = [(1, 1), (3, 1)]
mouth = [(1, 3), (2, 3), (3, 3)]

for x, y in eyes:
    microbit.draw(x, y, True)

for x, y in mouth:
    microbit.draw(x, y, True)

# Play a cheerful rising tone
microbit.sound(523, 0.15)   # C5
time.sleep(0.05)
microbit.sound(659, 0.15)   # E5
time.sleep(0.05)
microbit.sound(784, 0.3)    # G5

print("Hardware demo complete!")
print("Try pressing buttons A and B on the board.")
`
  },
  {
    badge: 'STEP 2',
    title: 'AI Engine Setup',
    desc: 'Configure the Gemma model running on the PyTorch backend. Adjust Temperature (controls randomness), Max Tokens (response length), and the System Prompt. Click "Apply Settings" to send your configuration to the model.',
    view: 'view-config',
    editorHint: 'Reference code — backend handles inference',
    runLabel: 'Apply Settings →',
    code: `import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# ── STEP 2: AI ENGINE SETUP ───────────────────────────────────
# This shows how the PyTorch backend loads and configures Gemma.
# Adjust the sliders and prompt on the right, then click Apply.
# ──────────────────────────────────────────────────────────────

# Device selection — automatically uses GPU if available
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Running on: {DEVICE}")

# Load model from local files already in this project
MODEL_PATH = "."   # All Gemma model files are in the root directory

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    local_files_only=True,
    torch_dtype=torch.bfloat16,    # Memory-efficient 16-bit format
    low_cpu_mem_usage=True,         # Stream weights to reduce peak RAM
)
model.eval()

# ── HYPERPARAMETERS ───────────────────────────────────────────
# Temperature  — controls output randomness
#   0.1  = Very deterministic, focused responses
#   0.7  = Balanced (recommended default)
#   1.2  = Creative, unpredictable
TEMPERATURE = 0.7

# Max new tokens — caps the response length
MAX_NEW_TOKENS = 200

# System prompt — sets the AI's personality and rules
SYSTEM_PROMPT = "You are a helpful AI classroom assistant."

# ── GENERATION ────────────────────────────────────────────────
def generate(user_message):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user",   "content": user_message},
    ]
    inputs = tokenizer.apply_chat_template(
        messages,
        tokenize=True,
        add_generation_prompt=True,
        return_tensors="pt"
    ).to(DEVICE)

    with torch.no_grad():
        out = model.generate(
            inputs,
            max_new_tokens=MAX_NEW_TOKENS,
            temperature=TEMPERATURE,
            do_sample=(TEMPERATURE > 0),
        )

    new_tokens = out[0][inputs.shape[1]:]
    return tokenizer.decode(new_tokens, skip_special_tokens=True).strip()

print(f"Temperature : {TEMPERATURE}")
print(f"Max tokens  : {MAX_NEW_TOKENS}")
print("Model ready — use the panel on the right to configure!")
`
  },
  {
    badge: 'STEP 3',
    title: 'Chatbot Interface',
    desc: 'Your Gemma model is now a chatbot. The premade code below shows exactly how the chat API works — send a message, receive a reply. Use the terminal on the right to have a real conversation with the model.',
    view: 'view-chat',
    editorHint: 'Premade — study the chat loop pattern',
    runLabel: 'Open Chat →',
    code: `# ── STEP 3: CHATBOT INTERFACE ────────────────────────────────
# This is the code that powers the chat panel on the right.
# Study the pattern: we POST to /api/chat and get a reply.
# ──────────────────────────────────────────────────────────────

import requests

BASE_URL = "http://localhost:5000"   # Flask backend address
conversation = []                    # Stores the full chat history

def send_message(user_text: str) -> str:
    """
    Send a message to Gemma and return its reply.

    The backend:
      1. Prepends the system prompt you configured in Step 2
      2. Appends the conversation history for context
      3. Runs torch.no_grad() inference with Gemma
      4. Returns the decoded output text
    """
    response = requests.post(f"{BASE_URL}/api/chat", json={
        "message": user_text,
        "history": conversation,      # Give the model memory
    })

    data = response.json()
    return data["reply"]


# ── CHAT LOOP ─────────────────────────────────────────────────
# In production this runs as a terminal loop.
# On the right panel, the same logic is wired to the UI.

print("Chatbot ready! Type your message in the panel →")
print("─" * 45)

while True:
    user_input = input("You: ").strip()

    if user_input.lower() in ["quit", "exit", "q"]:
        print("Goodbye!")
        break

    reply = send_message(user_input)
    print(f"AI : {reply}")
    print()

    # Keep conversation history for multi-turn context
    conversation.append({"role": "user",      "content": user_input})
    conversation.append({"role": "assistant",  "content": reply})
`
  },
  {
    badge: 'STEP 4',
    title: 'Function Calling Integration',
    desc: 'Combine everything! The AI acts as an invisible router — it reads your natural language and decides which hardware function to call. Type "I\'m hungry" and watch the LED grid light up. The AI parses intent, selects a function, and drives the hardware.',
    view: 'view-route',
    editorHint: 'AI routes text → hardware functions',
    runLabel: 'Show Routing →',
    code: `# ── STEP 4: FUNCTION CALLING INTEGRATION ─────────────────────
# The AI is now a hardware router. It reads plain English and
# calls the correct hardware function automatically.
#
# Try: "I'm hungry"  →  food pattern on LED grid
#      "play music"  →  musical note + tone
#      "I'm happy"   →  smiley face + sound
#      "wave hello"  →  wave pattern
# ──────────────────────────────────────────────────────────────

import microbit
import requests
import json

BASE_URL = "http://localhost:5000"

# ── HARDWARE FUNCTIONS ────────────────────────────────────────

def display_pattern(matrix: list[int], frequency: int = 440, duration: float = 0.3):
    """
    Display a custom 5×5 LED pattern.
    matrix: list of 25 values (0 or 1), row-major order.
    """
    microbit.clear()
    for i, val in enumerate(matrix):
        if val:
            microbit.draw(i % 5, i // 5, True)
    if frequency > 0:
        microbit.sound(frequency, duration)

def play_sound(frequency: int = 440, duration: float = 0.5):
    """Play a tone through the Micro:bit speaker."""
    microbit.sound(frequency, duration)


# ── AI ROUTING ENGINE ─────────────────────────────────────────

def route_to_hardware(user_text: str):
    """
    Send user text to Gemma. It responds with a JSON function call.
    We parse the JSON and execute the matching hardware function.
    """
    print(f"You said: '{user_text}'")

    response = requests.post(f"{BASE_URL}/api/route", json={"message": user_text})
    result   = response.json()
    action   = result["action"]
    method   = "AI" if result.get("ai_used") else "keyword"

    print(f"Router ({method}) selected: {action['function']}")

    fn = action["function"]

    if fn == "displayPattern":
        display_pattern(
            action.get("matrix", [0]*25),
            action.get("frequency", 440),
            action.get("duration", 0.3),
        )
    elif fn == "playSound":
        play_sound(
            action.get("frequency", 440),
            action.get("duration", 0.5),
        )

    print(f"Hardware updated! Pattern: {result.get('pattern', 'custom')}")
    print()


# ── TEST THE ROUTER ───────────────────────────────────────────
test_inputs = [
    "I am really hungry right now",
    "play me something happy",
    "I feel sad today",
]

for text in test_inputs:
    route_to_hardware(text)
    import time; time.sleep(1)
`
  }
];

// ── STATE ────────────────────────────────────────────────────────
let currentStep = 0;
let pyodide = null;
let chatHistory3 = [];
let audioCtx = null;

// ── LED GRIDS ─────────────────────────────────────────────────────
function buildGrid(containerId, count = 25) {
  const el = document.getElementById(containerId);
  el.innerHTML = '';
  const leds = [];
  for (let i = 0; i < count; i++) {
    const led = document.createElement('div');
    led.className = 'led';
    el.appendChild(led);
    leds.push(led);
  }
  return leds;
}

const ledsMain  = buildGrid('led-grid-main');
const ledsRoute = buildGrid('led-grid-route');

function setLeds(ledsArr, matrix) {
  matrix.forEach((v, i) => {
    if (i < ledsArr.length)
      ledsArr[i].classList.toggle('on', !!v);
  });
}

function clearLeds(ledsArr) { ledsArr.forEach(l => l.classList.remove('on')); }

// ── AUDIO ─────────────────────────────────────────────────────────
function playTone(freq, durationSec) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationSec);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + durationSec);
}

// ── PYODIDE INIT ──────────────────────────────────────────────────
const consoleStrip = document.getElementById('console-strip');
let consoleLines = [];

function appendConsole(text) {
  consoleLines.push(text);
  if (consoleLines.length > 8) consoleLines.shift();
  consoleStrip.textContent = consoleLines.join('\n');
  consoleStrip.classList.add('visible');
  consoleStrip.scrollTop = consoleStrip.scrollHeight;
}

async function initPyodide() {
  setRunStatus('info', '⏳ Loading Python (Pyodide)…');
  try {
    pyodide = await loadPyodide();

    // Build the microbit JS module bridging to hardware
    const hardwareAPI = {
      draw:  (x, y, state) => {
        if (x < 0 || x > 4 || y < 0 || y > 4) return;
        ledsMain[y * 5 + x].classList.toggle('on', !!state);
      },
      sound: (freq, dur)   => playTone(freq, dur),
      clear: ()            => clearLeds(ledsMain),
    };

    pyodide.registerJsModule('microbit', hardwareAPI);

    // Override print to also show in the console strip
    pyodide.runPython(`
import sys
class _StripIO:
    def write(self, s):
        from js import appendConsole
        if s.strip(): appendConsole(s.rstrip())
    def flush(self): pass
sys.stdout = _StripIO()
`);

    document.getElementById('btn-run').disabled = false;
    document.getElementById('btn-run').textContent = STEPS[0].runLabel;
    setRunStatus('ok', '✅ Python engine ready');
  } catch (err) {
    setRunStatus('err', '❌ Pyodide failed: ' + err.message);
  }
}

function setRunStatus(cls, text) {
  const el = document.getElementById('run-status');
  el.textContent = text;
  el.className = 'run-status ' + cls;
}

// ── RUN BUTTON ────────────────────────────────────────────────────
document.getElementById('btn-run').addEventListener('click', async () => {
  if (currentStep === 0) await runStep1();
  else if (currentStep === 1) await runStep2();
  else if (currentStep === 2) focusChatStep3();
  else if (currentStep === 3) focusChatStep4();
});

async function runStep1() {
  if (!pyodide) return;
  consoleLines = [];
  consoleStrip.classList.remove('visible');
  setRunStatus('info', '⏳ Running…');
  const code = document.getElementById('code-editor').value;
  try {
    await pyodide.runPythonAsync(code);
    setRunStatus('ok', '✅ Finished');
  } catch (err) {
    appendConsole('Error: ' + err.message);
    setRunStatus('err', '❌ ' + err.message.split('\n').pop());
  }
}

async function runStep2() {
  const temp   = parseFloat(document.getElementById('cfg-temp').value);
  const tokens = parseInt(document.getElementById('cfg-tokens').value);
  const prompt = document.getElementById('cfg-prompt').value.trim();
  applyConfig(temp, tokens, prompt);
}

function focusChatStep3() { document.getElementById('chat-input-3').focus(); }
function focusChatStep4() { document.getElementById('chat-input-4').focus(); }

// ── STEP NAVIGATION ───────────────────────────────────────────────
const stepMeta = [
  { name: 'Step 1: Hardware' },
  { name: 'Step 2: AI Engine' },
  { name: 'Step 3: Chatbot' },
  { name: 'Step 4: Function Calling' },
];

function goToStep(n) {
  if (n < 0 || n >= STEPS.length) return;
  currentStep = n;
  const s = STEPS[n];

  // Update tabs
  document.querySelectorAll('.step-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === n);
    tab.classList.toggle('done',   i < n);
  });

  // Update banner
  document.getElementById('step-badge').textContent = s.badge;
  document.getElementById('step-title').textContent = s.title;
  document.getElementById('step-desc').textContent  = s.desc;
  document.getElementById('editor-hint').textContent = s.editorHint;

  // Swap code
  document.getElementById('code-editor').value = s.code;

  // Swap view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(s.view).classList.add('active');

  // Run button label
  const btn = document.getElementById('btn-run');
  btn.textContent = (pyodide || n !== 0) ? s.runLabel : '⏳ Loading…';
  btn.disabled = (n === 0 && !pyodide);

  // Nav buttons
  document.getElementById('btn-prev').disabled = n === 0;
  document.getElementById('btn-next').disabled = n === STEPS.length - 1;
  document.getElementById('btn-next').classList.toggle('fwd', n < STEPS.length - 1);
  document.getElementById('nav-step-name').textContent = stepMeta[n].name;

  // Clear console strip
  consoleLines = [];
  consoleStrip.textContent = '';
  consoleStrip.classList.remove('visible');
  setRunStatus('', '');
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
  if (name !== 'x') playTone(440, 0.1);
};

// ── HARDWARE BUTTONS ──────────────────────────────────────────────
document.getElementById('hw-btn-a').addEventListener('click', () => {
  playTone(523, 0.12);
  setLeds(ledsMain, PRESETS.smiley);
  appendConsole('[Button A] pressed → smiley loaded');
});
document.getElementById('hw-btn-b').addEventListener('click', () => {
  playTone(392, 0.12);
  clearLeds(ledsMain);
  appendConsole('[Button B] pressed → display cleared');
});

// ── AI STATUS POLLING ─────────────────────────────────────────────
function pollAI() {
  fetch('/api/status')
    .then(r => r.json())
    .then(data => {
      const badge = document.getElementById('ai-badge');
      const text  = document.getElementById('ai-badge-text');
      const ms    = document.getElementById('model-status-box');
      const msTitle = document.getElementById('ms-title');
      const msSub   = document.getElementById('ms-sub');

      if (data.status === 'ready') {
        badge.className = 'ai-badge ready';
        text.textContent = 'Gemma Ready';

        ms.querySelector('.ms-icon').textContent = '✅';
        msTitle.textContent = 'Model loaded successfully';
        msSub.textContent   = `Running on ${data.device.toUpperCase()} • Temperature ${data.config.temperature} • Max tokens ${data.config.max_new_tokens}`;

        // Sync config panel
        document.getElementById('cfg-temp').value    = data.config.temperature;
        document.getElementById('cfg-temp-val').textContent = parseFloat(data.config.temperature).toFixed(2);
        document.getElementById('cfg-tokens').value  = data.config.max_new_tokens;
        document.getElementById('cfg-prompt').value  = data.config.system_prompt;

      } else if (data.status === 'error') {
        badge.className = 'ai-badge error';
        text.textContent = 'AI Error';
        ms.querySelector('.ms-icon').textContent = '❌';
        msTitle.textContent = 'Model load failed';
        msSub.textContent   = data.error || 'Check server logs for details.';
      } else {
        badge.className = 'ai-badge';
        text.textContent = 'AI Loading…';
        setTimeout(pollAI, 4000);
      }
    })
    .catch(() => setTimeout(pollAI, 6000));
}
pollAI();

// ── CONFIG PANEL ──────────────────────────────────────────────────
document.getElementById('cfg-temp').addEventListener('input', function () {
  document.getElementById('cfg-temp-val').textContent = parseFloat(this.value).toFixed(2);
});

async function applyConfig(temp, tokens, prompt) {
  const statusEl = document.getElementById('cfg-status');
  statusEl.className = 'run-status info';
  statusEl.textContent = '⏳ Sending configuration…';
  try {
    const res = await fetch('/api/configure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temperature: temp, max_new_tokens: tokens, system_prompt: prompt }),
    });
    const data = await res.json();
    if (data.success) {
      statusEl.className = 'run-status ok';
      statusEl.textContent = `✅ Applied — temp ${data.config.temperature}, tokens ${data.config.max_new_tokens}`;
    } else {
      throw new Error('Server rejected config');
    }
  } catch (err) {
    statusEl.className = 'run-status err';
    statusEl.textContent = '❌ ' + err.message;
  }
}

document.getElementById('btn-apply-cfg').addEventListener('click', () => {
  const temp   = parseFloat(document.getElementById('cfg-temp').value);
  const tokens = parseInt(document.getElementById('cfg-tokens').value);
  const prompt = document.getElementById('cfg-prompt').value.trim();
  applyConfig(temp, tokens, prompt);
});

// ── CHAT STEP 3 ────────────────────────────────────────────────────
async function sendChat3() {
  const input = document.getElementById('chat-input-3');
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = '';

  appendChatMsg('chat-messages', msg, 'user');
  const typingEl = appendTyping('chat-messages');

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: chatHistory3 }),
    });
    const data = await res.json();
    typingEl.remove();

    const reply = data.reply || '(no reply)';
    appendChatMsg('chat-messages', reply, 'ai');
    chatHistory3.push({ role: 'user',      content: msg });
    chatHistory3.push({ role: 'assistant', content: reply });
    if (chatHistory3.length > 20) chatHistory3 = chatHistory3.slice(-20);
  } catch (err) {
    typingEl.remove();
    appendChatMsg('chat-messages', '⚠️ Could not reach the AI server. Is it loaded yet?', 'ai');
  }
}

document.getElementById('chat-send-3').addEventListener('click', sendChat3);
document.getElementById('chat-input-3').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat3(); }
});

// ── CHAT STEP 4 (FUNCTION CALLING) ────────────────────────────────
async function sendRoute() {
  const input = document.getElementById('chat-input-4');
  const msg   = input.value.trim();
  if (!msg) return;
  input.value = '';

  appendChatMsg('route-messages', msg, 'user');
  const typingEl = appendTyping('route-messages');

  try {
    const res  = await fetch('/api/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();
    typingEl.remove();

    if (!data.success) throw new Error('Route failed');

    const action  = data.action;
    const aiUsed  = data.ai_used;
    const pattern = data.pattern;

    // Update route-info tag
    const tag   = document.getElementById('route-method-tag');
    const label = document.getElementById('route-pattern-label');
    tag.style.display = 'inline-block';
    tag.className      = 'route-tag ' + (aiUsed ? 'ai' : 'kw');
    tag.textContent    = aiUsed ? 'Gemma AI' : 'Keyword';
    label.textContent  = pattern ? `→ ${pattern}` : '→ custom';

    // Execute hardware action
    if (action.function === 'displayPattern' && action.matrix) {
      setLeds(ledsRoute, action.matrix);
      if (action.frequency) playTone(action.frequency, action.duration || 0.3);
      const reply = `🤖 Routed to <strong>displayPattern</strong> via ${aiUsed ? 'Gemma AI' : 'keyword matching'}${pattern ? ` → <em>${pattern}</em> pattern` : ''}.`;
      appendChatMsg('route-messages', reply, 'ai', true);
    } else if (action.function === 'playSound') {
      playTone(action.frequency || 440, action.duration || 0.5);
      const reply = `🔊 Routed to <strong>playSound</strong> — ${action.frequency}Hz for ${action.duration}s.`;
      appendChatMsg('route-messages', reply, 'ai', true);
    }

  } catch (err) {
    typingEl.remove();
    appendChatMsg('route-messages', '⚠️ Routing failed. Is the AI backend running?', 'ai');
  }
}

document.getElementById('chat-send-4').addEventListener('click', sendRoute);
document.getElementById('chat-input-4').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendRoute(); }
});

// ── CHAT HELPERS ───────────────────────────────────────────────────
function appendChatMsg(containerId, text, role, isHtml = false) {
  const container = document.getElementById(containerId);
  const row = document.createElement('div');
  row.className = `chat-msg ${role}`;

  const av = document.createElement('div');
  av.className = 'msg-av';
  av.textContent = role === 'user' ? 'You' : 'AI';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (isHtml) bubble.innerHTML = text;
  else        bubble.textContent = text;

  row.appendChild(av);
  row.appendChild(bubble);
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return row;
}

function appendTyping(containerId) {
  const container = document.getElementById(containerId);
  const row = document.createElement('div');
  row.className = 'chat-msg ai';
  row.innerHTML = `
    <div class="msg-av">AI</div>
    <div class="msg-bubble typing">
      <span class="typing-dots"><span></span><span></span><span></span></span>
    </div>`;
  container.appendChild(row);
  container.scrollTop = container.scrollHeight;
  return row;
}

// ── EXPOSE appendConsole to Pyodide ──────────────────────────────
window.appendConsole = appendConsole;

// ── INIT ──────────────────────────────────────────────────────────
goToStep(0);
initPyodide();
