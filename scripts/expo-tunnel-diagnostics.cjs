// Diagnostics only: reveal the public Expo tunnel URL in Render logs.
// Never print credentials or environment variables.
const http = require('node:http');
let attempts = 0;
const timer = setInterval(() => {
  if (++attempts > 180) return clearInterval(timer);
  http.get('http://127.0.0.1:4040/api/tunnels', {timeout:1500}, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      try {
        const tunnels = JSON.parse(data).tunnels || [];
        for (const tunnel of tunnels) {
          const url = tunnel.public_url;
          if (typeof url === 'string' && /^https:\/\//.test(url)) {
            console.log('EXPO_GO_TUNNEL_URL=' + url.replace(/^https:\/\//, 'exp://'));
            clearInterval(timer);
            return;
          }
        }
      } catch (_) {}
    });
  }).on('error', () => {});
}, 2000);
timer.unref();
