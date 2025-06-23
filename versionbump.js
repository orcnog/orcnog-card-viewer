const archiver = require('archiver');
const fs = require('fs');
const readlineSync = require('readline-sync');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Read paths from .env.local (no fallback)
const moduleJsonPath = process.env.MODULE_JSON_PATH;
const packageJsonPath = process.env.PACKAGE_JSON_PATH;
const distPath = process.env.DIST_PATH;
const releasesPath = process.env.RELEASES_PATH;
const readmePath = process.env.README_PATH;

// Read and parse the module.json file
const moduleJson = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf8'));

// Read and parse the package.json file
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get the current module ID from module.json
const moduleId = moduleJson.id;
console.log(`Module ID: ${moduleId}`);

// Get the current version from module.json
const currentVersion = moduleJson.version;
console.log(`Current version: ${currentVersion}`);

// Prompt the user for the new version number and release notes
const newVersion = readlineSync.question('Enter the new version number for the zip file (Ex: 1.0.1): ').trim();
const releaseNotes = readlineSync.question('Enter the release notes (if provided, will update the README.md file): ').trim();
console.log(`Input received - Version: ${newVersion}...`);
console.log(`Release received - Release Notes: ${releaseNotes}`);

// Update the version number in module.json
const updatedModuleJson = JSON.stringify(moduleJson, null, 2).replace(new RegExp(currentVersion, 'g'), newVersion);
fs.writeFileSync(moduleJsonPath, updatedModuleJson);
console.log(`${moduleJsonPath} updated successfully!`);

// Update the version number in package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log(`${packageJsonPath} updated successfully!`);

const zipFileName = `${moduleId}-v${newVersion}.zip`;
const outputDir = releasesPath;

// Ensure releases directory exists
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

// Create a new output stream for the zip file
const output = fs.createWriteStream(path.join(outputDir, zipFileName));
const archive = archiver('zip');

// Pipe the output stream to the archive
archive.pipe(output);

// Append the entire "dist" folder to the archive
archive.directory(distPath, false);

// Finalize the archive and close the output stream
archive.finalize();

// Listen for the "close" event to know when the archive has been created
output.on('close', () => {
  console.log(`${path.join(outputDir, zipFileName)} created successfully!`);

  // Update the README.md file with the release notes (if provided)
  if (releaseNotes !== '') {
    fs.appendFileSync(readmePath, `\n\n## v${newVersion}\n${releaseNotes}`);
    console.log(`${readmePath} updated successfully with release notes!`);
  }
});

// Listen for archive errors
archive.on('error', (err) => {
  throw err;
});
