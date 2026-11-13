const { getDefaultConfig } = require('expo/metro-config');
const http = require('node:http');

const config = getDefaultConfig(__dirname);
config.maxWorkers = 1;

// Render's free CPU can take longer to compile an iOS development bundle than
// the external proxy / Expo Go allows. Compile it locally on startup so the
// first phone request hits Metro's warm transform cache.
if (process.env.RENDER || process.env.PORT === '10000') {
  const existingEnhance = config.server && config.server.enhanceMiddleware;
  config.server = config.server || {};
  config.server.enhanceMiddleware = (middleware, server) => {
    const enhanced = existingEnhance ? existingEnhance(middleware, server) : middleware;
    const bundlePath = '/node_modules/expo-router/entry.bundle?platform=ios&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=app&unstable_transformProfile=hermes-stable';
    let attempt = 0;
    const warm = () => {
      attempt += 1;
      console.log('[bundle-warmup] iOS bundle attempt ' + attempt);
      const req = http.get({ hostname: '127.0.0.1', port: Number(process.env.PORT) || 10000, path: bundlePath }, (res) => {
        res.resume();
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('[bundle-warmup] iOS bundle ready (HTTP 200)');
          } else {
            console.log('[bundle-warmup] HTTP ' + res.statusCode);
            if (attempt < 12) setTimeout(warm, 20000);
          }
        });
      });
      req.on('error', (err) => {
        console.log('[bundle-warmup] ' + err.message);
        if (attempt < 12) setTimeout(warm, 20000);
      });
      req.setTimeout(600000, () => req.destroy(new Error('bundle warmup timed out')));
    };
    setTimeout(warm, 10000);
    return enhanced;
  };
}

module.exports = config;
