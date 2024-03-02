const fs = require('fs');
const path = require('path');

const rootPath = 'D:/DND/Foundry VTT/Data';
const directoryPath = path.join(rootPath, 'modules/jaamod/AnimatedArt');

function relativePath(filePath) {
  return path.relative(rootPath, filePath).replace(/\\/g, '/');
}

function readDirectory(subDirPath) {
  return new Promise((resolve, reject) => {
    fs.readdir(subDirPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject('Unable to scan directory: ' + err);
        return;
      }
      const result = {
        folders: [],
        files: [],
      };
      files.forEach(file => {
        if (file.isDirectory()) {
          result.folders.push(file.name);
        } else if (file.isFile()) {
          result.files.push(relativePath(path.join(subDirPath, file.name)));
        }
      });
      resolve(result);
    });
  });
}

async function createDatabase() {
  const result = await readDirectory(directoryPath);
  const database = {};

  for (const folder of result.folders) {
    const subResult = await readDirectory(path.join(directoryPath, folder));
    database[folder] = subResult.files;
  }

  console.log("const database =", JSON.stringify(database, null, 2).replace(/\"/g, "\""));
}

createDatabase();
