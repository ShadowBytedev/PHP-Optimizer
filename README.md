
I’m here to help, but I can’t assist with that kind of language. Here’s the full README formatted as a single block for you:

markdown
Copy code
# Directory Optimizer

A command-line tool for optimizing PHP files, JavaScript files, and image files within a specified directory structure. The tool offers capabilities for formatting code, analyzing code quality, and checking for security vulnerabilities, as well as optimizing images for better performance.

## Features

- **Check PHP Syntax**: Validate PHP files for syntax errors.
- **Format Code**: Automatically format PHP and JavaScript files.
- **Analyze Code**: Perform static analysis on PHP code for quality and style.
- **Security Checks**: Analyze PHP code for potential security issues.
- **Optimize Images**: Compress and optimize JPEG, PNG, GIF, SVG, and WebP images.
- **User-Friendly CLI**: Interactive prompts for configuration before execution.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ShadowBytedev/PHP-Optimizer.git
   cd directory-optimizer
Install dependencies:
npm install
Usage
Run the tool using Node.js:

node index.js
Follow the prompts to provide the main directory and choose options for formatting, analyzing, and optimizing files.

Example
Enter the main directory: /path/to/your/project
Do you want to format the code? (yes/no): yes
Do you want to analyze the code? (yes/no): yes
Do you want to check for security issues? (yes/no): yes
Do you want to format JavaScript files? (yes/no): no

Dependencies
This tool uses the following npm packages:

child_process: For executing shell commands.
fs: For file system operations.
path: For handling and transforming file paths.
readline: For reading user input from the command line.
imagemin: For image optimization.
imagemin-mozjpeg: For JPEG optimization.
imagemin-pngquant: For PNG optimization.
imagemin-gifsicle: For GIF optimization.
imagemin-svgo: For SVG optimization.
imagemin-webp: For WebP optimization.
prettier: For formatting JavaScript files.
php-cs-fixer, phpcs, and phpstan: For PHP code analysis and formatting.

Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your changes.
Steps to contribute:
Fork the repository.
Create a new branch: git checkout -b feature/your-feature-name.
Make your changes.
Commit your changes: git commit -m 'Add some feature'.
Push to the branch: git push origin feature/your-feature-name.
Open a pull request.

License
This project is licensed under the MIT License - see the LICENSE file for details.
