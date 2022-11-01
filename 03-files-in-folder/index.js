const path = require('path');
const fsPromises = require('fs/promises');

const dirpath = path.join(__dirname, 'secret-folder');

try {
  const filesPromise = fsPromises.readdir(dirpath, { withFileTypes: true });
  filesPromise.then(files => {
    files.forEach(file => {
      if (file.isFile()) {
        const extname = path.extname(file.name).replace('.', '');
        const filename = file.name.replace('.' + extname, '');
        fsPromises.stat(path.join(dirpath, file.name)).then(stats => {
          const filesize = (stats.size / 1024).toFixed(3);
          console.log(`${filename} - ${extname} - ${filesize}kb`);
        });
      }
    });
  });
} catch (err) {
  console.error(err);
}
