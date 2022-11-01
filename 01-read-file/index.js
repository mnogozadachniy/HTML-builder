const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'text.txt');
const readableStream = fs.createReadStream(filepath, 'utf-8');
readableStream.on('data', chunk => console.log(chunk));