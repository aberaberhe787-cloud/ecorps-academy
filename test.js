const fetch = require('node-fetch');
fetch('http://localhost:3000/api/gemini/generate', { method: 'POST', body: JSON.stringify({prompt: "hi"}), headers: {'Content-Type': 'application/json'} }).then(res => console.log(res.status)).catch(console.error);
