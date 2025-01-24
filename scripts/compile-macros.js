const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const readline = require('readline');
const fsExtra = require('fs-extra');
const chalk = require('chalk');

// Parse command line arguments
const args = process.argv.slice(2);
let inDir = 'macros';
let outDir = 'macros/_compiled_jsons';
let packedDir = 'macros/_compiled_levelDB';
let packedMacrosDir = 'macros/_compiled_levelDB/macros';
let unpackedDir = 'macros/_test_unpacked_jsons';

// Look for --in and --out in the npm script arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--in' && args[i + 1]) {
    inDir = args[i + 1];
    i++;
  } else if (args[i] === '--out' && args[i + 1]) {
    outDir = args[i + 1];
    i++;
  }
}

console.log(`Input directory: ${inDir}`);
console.log(`Output directory: ${outDir}`);

const MACROS_SOURCE_DIR = path.join(__dirname, '..', inDir);
const MACROS_OUTPUT_DIR = path.join(__dirname, '..', outDir);
const LEVELDB_OUTPUT_DIR = path.join(__dirname, '..', packedDir);
const LEVELDB_OUTPUT_MACROS_DIR = path.join(__dirname, '..', packedMacrosDir);
const TEST_UNPACKED_DIR = path.join(__dirname, '..', unpackedDir);

// Clean up output directories
function cleanDirectory(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`Cleaned ${dir}`);
  }
  fs.mkdirSync(dir, { recursive: true });
}

// Clean both output directories
console.log('\nCleaning output directories...');
cleanDirectory(MACROS_OUTPUT_DIR);
cleanDirectory(LEVELDB_OUTPUT_DIR);
cleanDirectory(LEVELDB_OUTPUT_MACROS_DIR);
cleanDirectory(TEST_UNPACKED_DIR);

// Generate a random ID (similar to the TOWwsX1u4d43kZYb format)
function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Convert kebab/snake case to Title Case with special handling for articles and prepositions
function toTitleCase(str) {
  const minorWords = new Set([
    'a', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'if', 'in', 
    'into', 'nor', 'of', 'off', 'on', 'onto', 'or', 'so', 'than', 
    'that', 'to', 'when', 'with'
  ]);

  // First split into words and convert each word
  const words = str.replace(/[-_]/g, ' ').split(' ');
  
  return words.map((word, index) => {
    // Convert word to lowercase first
    const lowercaseWord = word.toLowerCase();
    
    // Always capitalize first word or if it's not a minor word
    if (index === 0 || !minorWords.has(lowercaseWord)) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    // Keep minor words lowercase
    return lowercaseWord;
  }).join(' ');
}

// Split content into metadata and command sections
function splitContent(content) {
  const parts = content.split(/\/\*\*\*[\s\S]*?\*\//);
  if (parts.length === 1) {
    return { metadata: '', command: parts[0].trim() };
  }
  return { 
    metadata: content.match(/\/\*\*\*[\s\S]*?\*\//)[0],
    command: parts[1].trim()
  };
}

// Extract metadata from comment block
function parseMetadata(metadataBlock) {
  const metadata = {
    name: null,
    type: null,
    author: null,
    img: null,
    scope: null
  };

  if (!metadataBlock) return metadata;

  const lines = metadataBlock.split('\n');
  lines.forEach(line => {
    const match = line.match(/^\s*\*\s*(\w+):\s*(.+?)\s*$/);
    if (match) {
      const [, key, value] = match;
      if (key in metadata) {
        metadata[key] = value;
      }
    }
  });

  return metadata;
}

// Process each .js file in the macros directory
fs.readdirSync(MACROS_SOURCE_DIR).forEach(file => {
  if (!file.endsWith('.js')) return;

  const sourcePath = path.join(MACROS_SOURCE_DIR, file);
  const fileContent = fs.readFileSync(sourcePath, 'utf8');
  
  // Split content and parse metadata
  const { metadata: metadataBlock, command } = splitContent(fileContent);
  const metadata = parseMetadata(metadataBlock);

  // Just normalize line endings before stringify handles the rest
  const escapedCommand = command.replace(/\r\n/g, '\n');

  const id = generateId();
  
  // Create the JSON structure with fallback defaults
  const macroData = {
    name: metadata.name || toTitleCase(file.replace('.js', '')),
    type: metadata.type || "script",
    author: metadata.author || "orcnog",
    img: metadata.img || null,
    scope: metadata.scope || "global",
    command: escapedCommand,
    _id: id,
    _key: `!macros!${id}`
  };

  // Generate output filename
  const baseName = file.replace('.js', '');
  const titleCaseName = toTitleCase(baseName);
  const outputFileName = `${titleCaseName.replace(/ /g, '_')}_${id}.json`;
  const outputPath = path.join(MACROS_OUTPUT_DIR, outputFileName);

  // Write the JSON file
  fs.writeFileSync(outputPath, JSON.stringify(macroData, null, 2));
  console.log(`_compiled ${file} -> ${outputFileName}`);
});

// After processing all files, pack them into LevelDB
const packCommand = `fvtt package pack -n "macros" --id "${path.resolve(MACROS_OUTPUT_DIR)}" --od "${path.resolve(LEVELDB_OUTPUT_DIR)}"`;
const testUnpackCommand = `fvtt package unpack -n "macros" --id "${path.resolve(LEVELDB_OUTPUT_DIR)}" --od "${path.resolve(TEST_UNPACKED_DIR)}"`;

// Function to run a command and handle the results
function runCommand(command) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command}`);
        exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${stderr}`);
            reject(error);
        } else {
            console.log(stdout);
            resolve(stdout);
        }
        });
    });
}

// Prompt user for confirmation before copying LevelDB files
async function promptUser() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(chalk.yellow('Cross check the "_compiled_jsons" folder with the "_test_unpacked_jsons" folder -- the contents should match. If satisfied, press ENTER or "y" + ENTER to complete the process and copy the contents of the "_compiled_levelDB" folder into the "dist/packs/macros" folder now.\n\n') + 
        chalk.green('Copy generated LDB files into dist/packs/macros? (y/n): '), (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() || 'yes'); // Accept ENTER as "yes"
        });
    });
}

// Function to copy files from one directory to another
async function copyFiles(src, dest) {
    try {
        await fsExtra.copy(src, dest);
        console.log(`Copied files from ${src} to ${dest}`);
    } catch (err) {
        console.error(`Error copying files: ${err}`);
    }
}

// Run the commands sequentially
(async () => {
    try {
        console.log("Starting packing process...");
        await runCommand(packCommand);
        console.log("Packing completed!");

        console.log("Starting unpacking process...");
        await runCommand(testUnpackCommand);
        console.log("Unpacking completed!");

        // Prompt user for confirmation
        const userResponse = await promptUser();
        if (userResponse === '' || userResponse === 'y' || userResponse === 'yes') {
            // Copy LevelDB files to the destination
            await copyFiles(LEVELDB_OUTPUT_DIR, path.join(__dirname, '..', 'dist', 'packs'));
        } else {
            console.log("Operation cancelled. Exiting...");
        }

        console.log("All operations finished successfully!");
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
})();