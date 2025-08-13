
// Polyfills for Node.js globals in browser environment
if (typeof global === 'undefined') {
  window.global = window;
}

if (typeof process === 'undefined') {
  window.process = {
    env: { NODE_ENV: process?.env?.NODE_ENV || 'development' },
    nextTick: function(fn) { setTimeout(fn, 0); },
    browser: true,
    version: '',
    versions: { node: '0.0.0' }
  };
}

// Buffer polyfill if needed
if (typeof Buffer === 'undefined') {
  window.Buffer = require('buffer').Buffer;
}
