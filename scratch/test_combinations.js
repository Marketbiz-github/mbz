const apiKey = "YOUR_API_KEY_HERE";

async function test(url, model) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1
      })
    });
    console.log(`URL: ${url} | Model: ${model}`);
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Body: ${text.substring(0, 200)}...\n`);
  } catch (err) {
    console.log(`Failed for URL: ${url} | Model: ${model} | Error: ${err.message}\n`);
  }
}

async function run() {
  await test("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", "gemini-1.5-flash");
  await test("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", "models/gemini-1.5-flash");
  await test("https://generativelanguage.googleapis.com/v1beta/chat/completions", "gemini-1.5-flash");
  await test("https://generativelanguage.googleapis.com/v1/openai/chat/completions", "gemini-1.5-flash");
  await test("https://generativelanguage.googleapis.com/v1/chat/completions", "gemini-1.5-flash");
}

run();
