const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

const originalDir = path.join(__dirname, 'styles');
const targetFile = path.join(__dirname, 'project-dist', 'bundle.css');

function makeBundle(originDir, target) {
  const output = fs.createWriteStream(target);
  fsPromises.readdir(originDir, { withFileTypes: true })
    .then(files => {
      files.forEach(dirent => {
        if (dirent.isFile() && path.extname(dirent.name) === '.css') {
          const readableStream = fs.createReadStream(path.join(originDir, dirent.name), 'utf-8');
          readableStream.on('data', data => {
            output.write('\n/*   ' + dirent.name + ' begins   */\n\n');
            output.write(data);
          });
        }
      });
    });
};

makeBundle(originalDir, targetFile);