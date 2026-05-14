import os
import json
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# =====================================================================
# STEP 2: GEMMA SYSTEM HYPERPARAMETER CONFIGURATION & CALIBRATION
# =====================================================================

MODEL_ID = "google/gemma-2b-it"  # Utilizing instruction tuned model optimized for tasks
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print(f"[STATUS] Initializing computing pipeline framework context utilizing: {DEVICE}")

# Initialize low-level components mapping state profiles
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_ID,
    torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32
).to(DEVICE)

# Establish deterministic parsing rules via generation configs
INFERENCE_TEMPERATURE = 0.1  # Low temp to minimize hallucinations during functional routing
MAX_OUTPUT_TOKENS = 150

# Injection of immutable System constraints forcing structural compliance
SYSTEM_PROMPT = """
You are a deterministic microbit router agent. You must choose exactly one function for every input.
Available API Function Schema Definitions:
1. {"function": "displayHardwareImage", "arguments": {"matrix": [0/1 array of length 25]}}
2. {"function": "playHardwareAudio", "arguments": {"frequency": integer, "durationMs": integer}}

Rules:
- Respond ONLY with valid, minified, parseable JSON text containing nothing else.
- If input mentions food/hunger, output option 1 using a representative array pattern.
- If input mentions audio/noise/music, output option 2.
- If no direct match occurs, call option 2 with frequency 220 as a fallback default.
"""

def generate_gemma_response(user_input_string: str) -> str:
    """Combines core tokenizer pipelines with specific context maps."""
    # Structure system and user conversation message blocks formatted directly for Gemma structure
    formatted_chat = [
        {"role": "user", "content": f"{SYSTEM_PROMPT}\n\nUser Query: {user_input_string}"}
    ]

    prompt_tokens = tokenizer.apply_chat_template(formatted_chat, tokenize=True, add_generation_prompt=True, return_tensors="pt")
    prompt_tokens = prompt_tokens.to(DEVICE)

    with torch.no_grad():
        output_ids = model.generate(
            prompt_tokens,
            max_new_tokens=MAX_OUTPUT_TOKENS,
            temperature=INFERENCE_TEMPERATURE,
            do_sample=False  # Greedy search decoding path maximizing target accuracy
        )

    # Strip incoming system inputs leaving pure model reasoning paths
    generated_tokens = output_ids[0][len(prompt_tokens[0]):]
    raw_decoded_string = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()
    return raw_decoded_string

# =====================================================================
# STEP 3 & FINAL: CHATBOT LOOP INTEGRATION AND ROUTING ENGINE TEST
# =====================================================================

if __name__ == "__main__":
    print("\n--- [CALIBRATION COMPLETE] CLI Interface Bootstrapped ---")
    print("Testing operational rules. Enter text instructions down below.")

    # Static Validation Check Loops
    test_queries = ["I want some food", "Play an emergency siren", "Surprise me with something completely random"]

    print("\n[RUNNING AGENT AUTOMATED FUNCTION SCHEMA VALIDATION CHECKS]")
    for sample in test_queries:
        print(f"\n-> Query Input: '{sample}'")
        raw_output = generate_gemma_response(sample)
        print(f"-> AI Engine Model Structural Return:\n{raw_output}")

        # Verify valid JSON structured string logic block can parse safely
        try:
            parsed_json = json.loads(raw_output)
            print(f"[SUCCESS] Parsed Function Key Target: {parsed_json.get('function')}")
        except json.JSONDecodeError:
            print("[FAILURE] Output payload layout deviates from strictly defined json requirements")

    print("\n[SYSTEM] Pipeline diagnostic loop executed. Ready for production integration deployment.")
