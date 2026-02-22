// Simple start script for Render deployment
const path = require('path');
const { spawn } = require('child_process');

// Get the absolute path to the dist directory
const distPath = path.join(__dirname, 'dist', 'index.js');

console.log('Starting server from:', distPath);
console.log('Current directory:', __dirname);
console.log('Process cwd:', process.cwd());

// Start the server
require(distPath);
