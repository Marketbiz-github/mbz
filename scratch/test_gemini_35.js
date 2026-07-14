const apiKey = 'YOUR_API_KEY_HERE';
const url = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

async function test(model) {
  console.log('Testing', model);
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
  console.log('Status:', res.status);
  const body = await res.text();
  console.log('Body:', body);
}

test('gemini-3.5-flash');
