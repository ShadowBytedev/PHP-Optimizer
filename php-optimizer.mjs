import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import imagemin from 'imagemin';
import imageminMozjpeg from 'imagemin-mozjpeg';
import imageminPngquant from 'imagemin-pngquant';
import imageminGifsicle from 'imagemin-gifsicle';
import imageminSvgo from 'imagemin-svgo';
import imageminWebp from 'imagemin-webp';

// Helper to resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clear the console
console.clear();

// Initialize readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to run shell commands
const runCommand = (command, dir) => {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: dir }, (error, stdout, stderr) => {
      if (error) {
        reject(`Error in ${dir}: ${stderr || stdout}`);
      }
      resolve(stdout);
    });
  });
};

// Function to get all subdirectories, PHP files, and image files in a directory
const getDirectoriesAndFiles = (dir) => {
  let results = { directories: [], phpFiles: [], imageFiles: [], jsFiles: [] };

  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results.directories.push(file);
      const subResults = getDirectoriesAndFiles(file);
      results.directories = results.directories.concat(subResults.directories);
      results.phpFiles = results.phpFiles.concat(subResults.phpFiles);
      results.imageFiles = results.imageFiles.concat(subResults.imageFiles);
      results.jsFiles = results.jsFiles.concat(subResults.jsFiles);
    } else if (file.endsWith('.php')) {
      results.phpFiles.push(file);
    } else if (/\.(jpe?g|png|gif|svg|webp)$/i.test(file)) {
      results.imageFiles.push(file);
    } else if (file.endsWith('.js')) {
      results.jsFiles.push(file);
    }
  });

  return results;
};

// Function to check for syntax errors in PHP files
const checkPHPFiles = async (directories) => {
  for (const dir of directories) {
    console.log(`\nChecking PHP files in directory: ${dir}`);

    const { phpFiles } = getDirectoriesAndFiles(dir);

    for (const file of phpFiles) {
      try {
        // Skip encrypted files
        if (isEncryptedFile(file)) {
          console.log(`Skipping encrypted file: ${file}`);
          continue;
        }

        const result = await runCommand(`php -l ${file}`, path.dirname(file));
        console.log(`Checked ${file}: ${result}`);
      } catch (error) {
        console.error(`Syntax error in ${file}: ${error}`);
      }
    }
  }
};

// Function to determine if a file is encrypted (basic check)
const isEncryptedFile = (filePath) => {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  // Basic check for encrypted files, could be customized based on the encryption method
  return fileContent.includes('eval(base64_decode') || fileContent.includes('zend_loader');
};

// Function to optimize image files
const optimizeImageFiles = async (directories) => {
  for (const dir of directories) {
    console.log(`\nOptimizing image files in directory: ${dir}`);

    const { imageFiles } = getDirectoriesAndFiles(dir);

    for (const file of imageFiles) {
      try {
        const optimizedFiles = await imagemin([file], {
          destination: path.dirname(file),
          plugins: [
            imageminMozjpeg(),
            imageminPngquant(),
            imageminGifsicle(),
            imageminSvgo(),
            imageminWebp()
          ]
        });

        if (optimizedFiles.length > 0) {
          console.log(`Optimized image: ${file}`);
        } else {
          console.log(`No optimization performed on: ${file}`);
        }
      } catch (error) {
        console.error(`Error optimizing ${file}: ${error}`);
      }
    }
  }
};

// Function to format JavaScript files using Prettier
const formatJavaScriptFiles = async (directories) => {
  for (const dir of directories) {
    console.log(`\nFormatting JavaScript files in directory: ${dir}`);

    const { jsFiles } = getDirectoriesAndFiles(dir);

    for (const file of jsFiles) {
      try {
        const result = await runCommand(`npx prettier --write ${file}`, dir);
        console.log(`Formatted JavaScript file: ${file}\n${result}`);
      } catch (error) {
        console.error(`Error formatting JavaScript file ${file}: ${error}`);
      }
    }
  }
};

// Main function to optimize PHP, JavaScript, and image files
const optimizeFiles = async (directories, formatCode, analyzeCode, checkSecurity, formatJS) => {
  for (const dir of directories) {
    console.log(`\nProcessing directory: ${dir}`);

    // Check if the directory exists
    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
      console.error(`Directory does not exist: ${dir}`);
      continue; // Skip to the next directory
    }

    const { phpFiles } = getDirectoriesAndFiles(dir);

    if (phpFiles.length > 0) {
      // Format code if requested
      if (formatCode) {
        try {
          const result = await runCommand('php-cs-fixer fix .', dir); // Run formatter
          console.log('Formatted PHP code:\n', result);
          
          // Automatically fix issues found by PHPCS
          const fixResult = await runCommand('phpcbf .', dir); // Fix issues
          console.log('Automatically fixed PHP code:\n', fixResult);
        } catch (error) {
          console.error(`Error formatting PHP code: ${error}`);
        }
      }

      // Analyze code if requested
      if (analyzeCode) {
        try {
          const result = await runCommand('phpcs .', dir); // Run analyzer
          console.log('PHP Code analysis results:\n', result);
        } catch (error) {
          console.error(`Error analyzing PHP code: ${error}`);
        }
      }

      // Check security if requested
      if (checkSecurity) {
        try {
          const result = await runCommand('phpstan analyse --level max .', dir); // Analyze for security
          console.log('PHP Security analysis results:\n', result);
        } catch (error) {
          console.error(`Error running PHP security analysis: ${error}`);
        }
      }
    } else {
      console.log(`No PHP files found in directory: ${dir}`);
    }

    // Optimize image files
    try {
      await optimizeImageFiles([dir]);
    } catch (error) {
      console.error(`Error optimizing image files: ${error}`);
    }

    // Format JavaScript files if requested
    if (formatJS) {
      try {
        await formatJavaScriptFiles([dir]);
      } catch (error) {
        console.error(`Error formatting JavaScript files: ${error}`);
      }
    }
  }

  console.log('\nProcessing complete!');
};

// User prompts
const promptUser = async () => {
  return new Promise((resolve) => {
    rl.question('Enter the main directory: ', (mainDir) => {
      if (!mainDir) {
        console.error('No valid directory provided. Exiting...');
        rl.close();
        return;
      }

      rl.question('Do you want to format the code? (yes/no): ', (formatInput) => {
        const formatCode = formatInput.toLowerCase() === 'yes';

        rl.question('Do you want to analyze the code? (yes/no): ', (analyzeInput) => {
          const analyzeCode = analyzeInput.toLowerCase() === 'yes';

          rl.question('Do you want to check for security issues? (yes/no): ', (securityInput) => {
            const checkSecurity = securityInput.toLowerCase() === 'yes';

            rl.question('Do you want to format JavaScript files? (yes/no): ', (jsFormatInput) => {
              const formatJS = jsFormatInput.toLowerCase() === 'yes';

              resolve({ mainDir, formatCode, analyzeCode, checkSecurity, formatJS });
            });
          });
        });
      });
    });
  });
};

// Start the script
const start = async () => {
  const { mainDir, formatCode, analyzeCode, checkSecurity, formatJS } = await promptUser();
  const { directories } = getDirectoriesAndFiles(mainDir);
  await optimizeFiles([mainDir, ...directories], formatCode, analyzeCode, checkSecurity, formatJS);
  await checkPHPFiles([mainDir, ...directories]); // Check for syntax errors
  rl.close();
};

start();
