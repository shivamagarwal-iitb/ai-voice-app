const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// Keep Metro within Render Free's 512 MB memory limit during iOS bundling.
config.maxWorkers = 1;

module.exports = config;
