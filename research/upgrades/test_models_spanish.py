"""Test which LLM models follow Spanish language instructions via DashScope API."""
import requests
import json
import time
import sys

API_KEY = "sk-sp-b73925f4776b447898dc7b64b34bbec4"
BASE_URL = "https://coding-intl.dashscope.aliyuncs.com/v1"

MODELS = [
    "qwen3.5-plus",
    "qwen3-max-2026-01-23",
    "qwen3-coder-next",
    "qwen3-coder-plus",
    "glm-5",
    "glm-4.7",
    "kimi-k2.5",
    "MiniMax-M2.5",
]

# Simulates what MiroFish sends: English system prompt + Spanish language instruction
SYSTEM_PROMPT = """You are a social media user profile generation expert. Generate detailed, realistic personas for opinion simulation, maximizing fidelity to existing real-world conditions. You must return valid JSON format.

Por favor, responde en español."""

USER_PROMPT = """Generate a short social media post (max 280 characters) as if you were Pedro Soto, a 52-year-old school principal from Rancagua, Chile. He is skeptical of educational technology replacing traditional teaching methods. He just heard about EduPlay, a free educational gaming app for children aged 4-8.

Write ONLY the post text, nothing else. The post must be in the language specified in the system prompt."""

results = []

for model in MODELS:
    print(f"\n{'='*60}")
    print(f"Testing: {model}")
    print(f"{'='*60}")

    try:
        start = time.time()
        resp = requests.post(
            f"{BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": USER_PROMPT},
                ],
                "temperature": 0.7,
                "max_tokens": 300,
            },
            timeout=120,
        )
        elapsed = time.time() - start

        if resp.status_code == 200:
            data = resp.json()
            content = data["choices"][0]["message"]["content"].strip()
            # Remove thinking tags if present
            if "</think>" in content:
                content = content.split("</think>")[-1].strip()

            # Detect language (simple heuristic)
            import re
            has_chinese = bool(re.search(r'[\u4e00-\u9fff]', content))
            has_spanish = bool(re.search(r'[áéíóúñ¿¡]', content))

            if has_chinese and not has_spanish:
                lang = "CHINESE"
            elif has_spanish and not has_chinese:
                lang = "SPANISH"
            elif has_spanish and has_chinese:
                lang = "MIXED"
            else:
                lang = "ENGLISH/OTHER"

            print(f"Language: {lang}")
            print(f"Time: {elapsed:.1f}s")
            print(f"Response: {content[:200]}")

            results.append({
                "model": model,
                "language": lang,
                "time": round(elapsed, 1),
                "content": content[:300],
                "status": "OK",
            })
        else:
            error = resp.text[:200]
            print(f"ERROR {resp.status_code}: {error}")
            results.append({
                "model": model,
                "language": "N/A",
                "time": 0,
                "content": error,
                "status": f"ERROR {resp.status_code}",
            })
    except Exception as e:
        print(f"EXCEPTION: {e}")
        results.append({
            "model": model,
            "language": "N/A",
            "time": 0,
            "content": str(e)[:200],
            "status": "EXCEPTION",
        })

# Summary
print("\n\n" + "="*80)
print("SUMMARY: Model Language Compliance Test")
print("="*80)
print(f"{'Model':<25} {'Status':<10} {'Language':<15} {'Time':>6}")
print("-"*60)
for r in results:
    print(f"{r['model']:<25} {r['status']:<10} {r['language']:<15} {r['time']:>5.1f}s")

print("\n\nDETAILED RESPONSES:")
print("="*80)
for r in results:
    print(f"\n--- {r['model']} ({r['language']}) ---")
    print(r['content'])

# Save results
with open("test_models_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print("\n\nResults saved to test_models_results.json")
