const archiver = require('archiver');
const fs = require('fs');
const readlineSync = require('readline-sync');
const path = require('path');

// Read the module.json file
const moduleJsonPath = 'dist/module.json';
const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));

// Get the current version from module.json
const currentVersion = moduleJson.version;
console.log(`Current version: ${currentVersion}`);

// Prompt the user for the new version number
const newVersion = readlineSync.question('Enter the new version number for the zip file (Ex: 1.0.1): ').trim();
console.log(`Input received: ${newVersion}...`);

// Update the version number in module.json
const updatedModuleJson = JSON.stringify(moduleJson, null, 2).replace(new RegExp(currentVersion, 'g'), newVersion);
fs.writeFileSync(moduleJsonPath, updatedModuleJson);
console.log(`dist/module.json updated successfully!`);

const outputDir = './releases';
const zipFileName = `orcnog-card-viewer-v${newVersion}.zip`;

// Copy the updated module.json to the zip_releases folder
const updatedModuleJsonPath = path.join(outputDir, 'module.json');
fs.copyFileSync(moduleJsonPath, updatedModuleJsonPath);
console.log(`Updated module.json copied to ${updatedModuleJsonPath}`);

// Create a new output stream for the zip file
const output = fs.createWriteStream(`${outputDir}/${zipFileName}`);
const archive = archiver('zip');

// Pipe the output stream to the archive
archive.pipe(output);

// Append the entire "dist" folder to the archive
archive.directory('dist/', false);

// Finalize the archive and close the output stream
archive.finalize();

// Listen for the "close" event to know when the archive has been created
output.on('close', () => {
  console.log(`./${outputDir}/${zipFileName} created successfully!`);
});

// Listen for archive errors
archive.on('error', (err) => {
  throw err;
});
