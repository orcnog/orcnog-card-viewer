// Zip up the contents of the /dist folder, and name the created zip file with a version number.
// Usage: npm run zip

const archiver = require('archiver');
const fs = require('fs');
const readlineSync = require('readline-sync');

// Get the version number from user.
const version = readlineSync.question('Enter the version number for the zip file (Ex: 1.0.1): ').trim();
console.log(`Input received: ${version}...`);

// Create a new output stream for the zip file
const output = fs.createWriteStream(`./zip_releases/orcnog-card-viewer-v${version}.zip`);
const archive = archiver('zip');

// Pipe the output stream to the archive
archive.pipe(output);

// Append the entire "dist" folder to the archive
archive.directory('dist/', false);

// Finalize the archive and close the output stream
archive.finalize();

// Listen for the "close" event to know when the archive has been created
output.on('close', () => {
  console.log(`./zip_releases/orcnog-card-viewer-v${version}.zip created successfully!`);
});

// Listen for archive errors
archive.on('error', (err) => {
  throw err;
});
