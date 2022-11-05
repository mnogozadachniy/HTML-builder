const path = require('path');
const fs = require('fs');
const fsPromises = require('fs/promises');

// make ./project-dist dir
async function mkDir(dir) {
  fsPromises.mkdir(dir, { recursive: true });
};

// consolidate *.html from ./components with template.html in ./project-dist/index.html
async function makeMarkupBundle(template, componentDir, target) {
  try {
    const input = fs.createReadStream(template, 'utf-8');
    const output = fs.createWriteStream(target);
    let content;

    //save template.html as content
    input.on('data', (data) => {
      content = data;
    });

    input.on('close', () => {

      //save NAME.html in ./components dir as a 0-th element of included array in array components
      //save content of NAME.html in ./components dir as a 1-th element of included array in array components
      let components = [];
      fs.readdir(componentDir, { withFileTypes: true },
        (err, files) => {
          if (err) throw console.error(err);
          for (let i = 0; i < files.length; i++) {
            if (files[i].isFile() && path.extname(files[i].name) === '.html') {
              const component = fs.createReadStream(path.join(componentDir, files[i].name), 'utf-8');
              component.on('data', (data) => {
                let componentName = files[i].name.replace('.html', '');
                components.push([componentName, data]);

                //at the end of all files in ./components dir
                //replace all {{tags}} in content ans wrte content to output
                if (i == (files.length - 1)) {
                  for (let j = 0; j < components.length; j++) {
                    content = content.replace('{{' + components[j][0] + '}}', components[j][1]);
                  }
                  output.write(content);
                }
              });
            }
          };
        });
    });
  } catch (error) {
    if (error) console.error(error);
  }
};


// consolidate style.css in ./project-dist dir
async function makeStyleBundle(originDir, target) {
  const output = fs.createWriteStream(target);
  fsPromises.readdir(originDir, { withFileTypes: true })
    .then(files => {
      files.forEach(async dirent => {
        if (dirent.isFile() && path.extname(dirent.name) === '.css') {
          const readableStream = fs.createReadStream(path.join(originDir, dirent.name), 'utf-8');
          await readableStream.on('data', data => {
            output.write('\n\n/*   ' + dirent.name + ' begins   */\n\n');
            output.write(data);
          });
        }
      });
    });
};

// copy Assets files from ./assets to ./project-dist/assets dir
async function copyAssets(origin, target) {
  makeDirTree(origin, target);
  copyFiles(origin, target);
};

async function makeDirTree(origin, target) {
  mkDir(target);
  const originFilesPromise = fsPromises.readdir(origin, { withFileTypes: true });
  originFilesPromise.then(files => {
    files.forEach(dirent => {
      if (dirent.isDirectory()) {
        makeDirTree(path.join(origin, dirent.name), path.join(target, dirent.name))
      }
    });
  });
};

async function copyFiles(origin, target) {
  const originFilesPromise = fsPromises.readdir(origin, { withFileTypes: true });
  let originFiles;
  originFilesPromise.then(files => {
    originFiles = files;
    originFiles.forEach(dirent => {
      if (dirent.isDirectory()) {
        copyFiles(path.join(origin, dirent.name), path.join(target, dirent.name))
      } else {
        fsPromises.copyFile(path.join(origin, dirent.name), path.join(target, dirent.name));
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
        }
      });
    });
  });
};

async function makeProject() {
  await mkDir(path.join(__dirname, 'project-dist'));
  await makeStyleBundle(path.join(__dirname, 'styles'), path.join(__dirname, 'project-dist', 'style.css'));
  await copyAssets(path.join(__dirname, 'assets'), path.join(__dirname, 'project-dist', 'assets'));
  await makeMarkupBundle(path.join(__dirname, 'template.html'), path.join(__dirname, 'components'), path.join(__dirname, 'project-dist', 'index.html'))
}

makeProject();