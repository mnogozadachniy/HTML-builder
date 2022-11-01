const fs = require('fs');
const path = require('path');
const { exit, stdin } = require('process');

const filepath = path.join(__dirname, 'output.txt');
const output = fs.createWriteStream(filepath);

process.on('SIGINT', onExit);

function onExit() {
  console.log('Goodbye, my sweetie peach :*');
  exit();
}

console.log('Hello! Type something here, please... ');
stdin.on('data', data => {
  if (data.toString().trim() === 'exit') {
    onExit();
  }
  output.write(data);
});