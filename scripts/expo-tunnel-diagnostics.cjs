// Expo tunnel diagnostics: print only public connection URLs, never credentials.
const http = require('node:http');
const fs = require('node:fs');
let attempts = 0;
const timer = setInterval(() => {
  attempts++;
  if (attempts > 90) return clearInterval(timer);
  if (attempts === 1 || attempts % 10 === 0) console.log('EXPO_DIAGNOSTIC_POLL=' + attempts);
  for (const port of [4040, 4041]) {
    const req = http.get('http://127.0.0.1:' + port + '/api/tunnels', {timeout:1000}, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const tunnels = JSON.parse(data).tunnels || [];
          for (const t of tunnels) {
            if (typeof t.public_url === 'string' && t.public_url.startsWith('https://')) {
              console.log('EXPO_GO_TUNNEL_URL=' + t.public_url.replace('https://', 'exp://'));
              clearInterval(timer);
              return;
            }
          }
        } catch (_) {}
      });
    });
    req.on('error', e => { if (attempts === 1) console.log('EXPO_DIAGNOSTIC_PORT_' + port + '=' + e.code); });
    req.on('timeout', () => req.destroy());
  }
  if (attempts === 10) {
    try {
      const settings = JSON.parse(fs.readFileSync('.expo/settings.json', 'utf8'));
      console.log('EXPO_SETTINGS_HOST_TYPE=' + (settings.hostType || 'not-set'));
    } catch (_) { console.log('EXPO_SETTINGS_UNAVAILABLE'); }
  }
}, 2000);
