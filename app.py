import os
import re
import json
import threading
import torch
from flask import Flask, request, jsonify, send_from_directory
from transformers import AutoTokenizer, AutoModelForCausalLM

app = Flask(__name__, static_folder='.')

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
MODEL_PATH = '.'

model_state = {
    'status': 'loading',
    'model': None,
    'tokenizer': None,
    'error': None
}

model_config = {
    'temperature': 0.7,
    'max_new_tokens': 200,
    'system_prompt': 'You are a helpful AI classroom assistant. Be concise and friendly.'
}

LED_PATTERNS = {
    'food':    [0,1,0,1,0, 0,1,0,1,0, 0,1,1,1,0, 0,0,1,0,0, 0,0,1,0,0],
    'happy':   [0,1,0,1,0, 0,1,0,1,0, 0,0,0,0,0, 1,0,0,0,1, 0,1,1,1,0],
    'sad':     [0,1,0,1,0, 0,1,0,1,0, 0,0,0,0,0, 0,1,1,1,0, 1,0,0,0,1],
    'heart':   [0,1,0,1,0, 1,1,1,1,1, 1,1,1,1,1, 0,1,1,1,0, 0,0,1,0,0],
    'wave':    [1,0,0,0,1, 1,0,0,0,1, 1,0,1,0,1, 1,1,0,1,1, 1,0,0,0,1],
    'music':   [0,1,1,0,0, 0,1,1,0,0, 0,1,0,0,0, 1,1,0,0,0, 1,1,0,0,0],
    'warning': [0,0,1,0,0, 0,1,1,1,0, 0,1,0,1,0, 1,1,1,1,1, 0,0,1,0,0],
    'fire':    [0,0,1,0,0, 0,1,1,1,0, 1,1,1,1,1, 1,1,1,1,1, 0,1,1,1,0],
    'star':    [0,0,1,0,0, 1,1,1,1,1, 0,1,1,1,0, 0,1,0,1,0, 1,0,0,0,1],
    'arrow':   [0,0,1,0,0, 0,0,1,1,0, 1,1,1,1,1, 0,0,1,1,0, 0,0,1,0,0],
}

PATTERN_SOUNDS = {
    'food': 330, 'happy': 523, 'sad': 220, 'heart': 440,
    'wave': 392, 'music': 440, 'warning': 880, 'fire': 660,
    'star': 587, 'arrow': 494,
}


def load_model():
    try:
        model_state['status'] = 'loading'
        tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_PATH,
            local_files_only=True,
            torch_dtype=torch.bfloat16,
            low_cpu_mem_usage=True,
        )
        model.eval()
        model_state['tokenizer'] = tokenizer
        model_state['model'] = model
        model_state['status'] = 'ready'
        print(f'[AI] Model ready on {DEVICE}', flush=True)
    except Exception as e:
        model_state['status'] = 'error'
        model_state['error'] = str(e)
        print(f'[AI] Model load error: {e}', flush=True)


threading.Thread(target=load_model, daemon=True).start()


def _apply_template(messages):
    tokenizer = model_state['tokenizer']
    try:
        return tokenizer.apply_chat_template(
            messages, tokenize=True, add_generation_prompt=True, return_tensors='pt'
        )
    except Exception:
        merged = []
        prefix = ''
        for m in messages:
            if m['role'] == 'system':
                prefix = m['content'] + '\n\n'
            else:
                merged.append(m)
        if merged and merged[0]['role'] == 'user':
            merged[0] = {'role': 'user', 'content': prefix + merged[0]['content']}
        return tokenizer.apply_chat_template(
            merged, tokenize=True, add_generation_prompt=True, return_tensors='pt'
        )


def generate(messages, temperature=None, max_new_tokens=None):
    if model_state['status'] != 'ready':
        raise RuntimeError(f"Model not ready ({model_state['status']})")

    model = model_state['model']
    temp = temperature if temperature is not None else model_config['temperature']
    max_tok = max_new_tokens if max_new_tokens is not None else model_config['max_new_tokens']

    inputs = _apply_template(messages).to(DEVICE)

    with torch.no_grad():
        outputs = model.generate(
            inputs,
            max_new_tokens=int(max_tok),
            temperature=float(temp) if temp > 0 else None,
            do_sample=(temp > 0),
        )

    new_tokens = outputs[0][inputs.shape[1]:]
    return model_state['tokenizer'].decode(new_tokens, skip_special_tokens=True).strip()


def classify_input(text):
    t = text.lower()
    if any(w in t for w in ['hungry', 'food', 'eat', 'pizza', 'burger', 'snack', 'meal', 'dinner', 'lunch', 'bread', 'cook']):
        return 'food'
    if any(w in t for w in ['heart', 'love', 'care', 'romantic', 'crush']):
        return 'heart'
    if any(w in t for w in ['happy', 'great', 'excited', 'amazing', 'awesome', 'joy', 'yay', 'good', 'wonderful']):
        return 'happy'
    if any(w in t for w in ['sad', 'upset', 'terrible', 'depressed', 'unhappy', 'cry', 'down', 'bad']):
        return 'sad'
    if any(w in t for w in ['hello', 'hi ', 'hey', 'wave', 'greet', 'howdy']):
        return 'wave'
    if any(w in t for w in ['music', 'song', 'dance', 'play', 'beat', 'tune', 'melody']):
        return 'music'
    if any(w in t for w in ['danger', 'warning', 'alarm', 'alert', 'emergency', 'help']):
        return 'warning'
    if any(w in t for w in ['fire', 'hot', 'burn', 'flame']):
        return 'fire'
    if any(w in t for w in ['star', 'night', 'sky', 'space', 'cool']):
        return 'star'
    return 'happy'


ROUTE_PROMPT = """You are a hardware routing agent for a BBC Micro:bit classroom simulator.
Parse the user's message and respond ONLY with a single valid JSON object — no other text.

Available functions:
1. displayPattern — show an LED pattern
   {"function": "displayPattern", "matrix": [25 values of 0 or 1 representing a 5x5 grid], "frequency": <int hz>, "duration": <float seconds>}

2. playSound — play audio only
   {"function": "playSound", "frequency": <int hz>, "duration": <float seconds>}

Pattern category rules:
- food / hungry / eat   → fork/food shape, frequency 330
- happy / excited / yay → smiley face, frequency 523
- sad / upset / bad     → sad face, frequency 220
- love / heart          → heart shape, frequency 440
- hello / hi / wave     → wave shape, frequency 392
- music / song / dance  → musical note, frequency 440
- danger / alarm        → warning shape, frequency 880

Respond ONLY with a JSON object. No prose, no code fences, just JSON."""


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/style.css')
def css():
    return send_from_directory('.', 'style.css')


@app.route('/script.js')
def js():
    return send_from_directory('.', 'script.js')


@app.route('/api/status')
def api_status():
    return jsonify({
        'status': model_state['status'],
        'device': DEVICE,
        'error': model_state['error'],
        'config': model_config
    })


@app.route('/api/configure', methods=['POST'])
def api_configure():
    data = request.json or {}
    if 'temperature' in data:
        model_config['temperature'] = max(0.0, min(2.0, float(data['temperature'])))
    if 'max_new_tokens' in data:
        model_config['max_new_tokens'] = max(10, min(500, int(data['max_new_tokens'])))
    if 'system_prompt' in data:
        model_config['system_prompt'] = str(data['system_prompt'])[:1000]
    return jsonify({'success': True, 'config': model_config})


@app.route('/api/chat', methods=['POST'])
def api_chat():
    data = request.json or {}
    message = data.get('message', '').strip()
    history = data.get('history', [])

    if not message:
        return jsonify({'success': False, 'reply': 'Empty message'}), 400

    messages = [{'role': 'system', 'content': model_config['system_prompt']}]
    messages.extend(history[-10:])
    messages.append({'role': 'user', 'content': message})

    try:
        reply = generate(messages)
        return jsonify({'success': True, 'reply': reply})
    except Exception as e:
        return jsonify({'success': False, 'reply': f'Error: {e}'}), 500


@app.route('/api/route', methods=['POST'])
def api_route():
    data = request.json or {}
    message = data.get('message', '').strip()

    if not message:
        return jsonify({'success': False}), 400

    ai_used = False
    pattern_key = classify_input(message)

    if model_state['status'] == 'ready':
        try:
            msgs = [{'role': 'user', 'content': f"{ROUTE_PROMPT}\n\nUser message: {message}"}]
            raw = generate(msgs, temperature=0.1, max_new_tokens=120)
            match = re.search(r'\{[^{}]*\}', raw, re.DOTALL)
            if match:
                action = json.loads(match.group())
                if 'function' in action:
                    ai_used = True
                    return jsonify({'success': True, 'action': action, 'ai_used': True, 'pattern': None})
        except Exception:
            pass

    matrix = LED_PATTERNS[pattern_key]
    freq = PATTERN_SOUNDS[pattern_key]

    return jsonify({
        'success': True,
        'action': {
            'function': 'displayPattern',
            'matrix': matrix,
            'frequency': freq,
            'duration': 0.3
        },
        'ai_used': ai_used,
        'pattern': pattern_key
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
