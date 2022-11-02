const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

const originalDir = path.join(__dirname, 'files');
const targetDir = path.join(__dirname, 'files-copy');

function copy(origin, target) {
  makeDirTree(origin, target);
  copyFiles(origin, target);
};

function mkdir(target) {
  fsPromises.mkdir(target, { recursive: true });
  console.log(target, 'dir is created');
};

function makeDirTree(origin, target) {
  mkdir(target);
  const originFilesPromise = fsPromises.readdir(origin, { withFileTypes: true });
  originFilesPromise.then(files => {
    files.forEach(dirent => {
      if (dirent.isDirectory()) {
        makeDirTree(path.join(origin, dirent.name), path.join(target, dirent.name))
      }
    });
  });
};

function copyFiles(origin, target) {
  const originFilesPromise = fsPromises.readdir(origin, { withFileTypes: true });
  let originFiles;
  originFilesPromise.then(files => {
    originFiles = files;
    originFiles.forEach(dirent => {
      if (dirent.isDirectory()) {
        copyFiles(path.join(origin, dirent.name), path.join(target, dirent.name))
      } else {
        fsPromises.copyFile(path.join(origin, dirent.name), path.join(target, dirent.name));
        console.log(path.join(origin, dirent.name), 'file is copied');
      }
    });
  }).then(() => {
    const targetFilesPromise = fsPromises.readdir(target, { withFileTypes: true });
    targetFilesPromise.then(files => {
      files.forEach(file => {
        if (!originFiles.some(originfile => originfile.name === file.name)) {
          fs.unlink(path.join(target, file.name), (err => {
            if (err) console.log(err);
          }));
          console.log(path.join(target, file.name), 'file is deleted');
        }
      });
    });
  });
};

copy(originalDir, targetDir);