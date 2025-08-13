
// Polyfills for Node.js globals in browser environment
if (typeof global === 'undefined') {
  window.global = window;
}

if (typeof process === 'undefined') {
  window.process = {
    env: { NODE_ENV: 'development' },
    nextTick: function(fn) { setTimeout(fn, 0); },
    browser: true,
    version: '',
    versions: { node: '0.0.0' }
  };
}

// Buffer polyfill - will be resolved by webpack
if (typeof Buffer === 'undefined') {
  try {
    const { Buffer } = require('buffer');
    window.Buffer = Buffer;
  } catch (e) {
    // Fallback if buffer polyfill fails
    console.warn('Buffer polyfill not available');
  }
}

// These will be resolved by webpack fallbacks in craco.config.js
// No need to manually require them here
