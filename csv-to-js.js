const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Simple CSV parser that handles quoted values
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Handle escaped quotes ("")
                current += '"';
                i += 2;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current.trim());
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }

    // Add the last field
    result.push(current.trim());

    return result;
}

// Escape single quotes in values and wrap with single quotes
function formatValue(value) {
    if (value === null || value === undefined) {
        return "''";
    }

    // Convert to string and escape single quotes
    const stringValue = String(value).replace(/'/g, "\\'");
    return `'${stringValue}'`;
}

async function convertCSVToJS(inputPath, outputPath) {
    const fileStream = fs.createReadStream(inputPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity // Handle Windows line endings
    });

    let headers = null;
    let isFirstLine = true;
    let objects = [];

    console.log('Processing CSV file...');

    for await (const line of rl) {
        // Skip empty lines
        if (!line.trim()) continue;

        const fields = parseCSVLine(line);

        if (isFirstLine) {
            // First line contains headers
            headers = fields.map(header => header.replace(/^"|"$/g, '').trim());
            isFirstLine = false;
            console.log(`Found ${headers.length} columns:`, headers);
        } else {
            // Create object from data row
            const obj = {};
            headers.forEach((header, index) => {
                const value = fields[index] || '';
                // Remove surrounding quotes if present
                const cleanValue = value.replace(/^"|"$/g, '');
                obj[header] = cleanValue;
            });
            objects.push(obj);
        }
    }

    console.log(`Processed ${objects.length} data rows`);

    // Generate JavaScript module content
    const jsContent = generateJSModule(objects, headers);

    // Write to output file
    fs.writeFileSync(outputPath, jsContent, 'utf8');
    console.log(`JavaScript module written to: ${outputPath}`);
}

function generateJSModule(objects, headers) {
    let content = '// Auto-generated JavaScript module from CSV\n';
    content += '// Generated on: ' + new Date().toISOString() + '\n\n';
    content += 'export default [\n';

    objects.forEach((obj, index) => {
        content += '  {\n';
        headers.forEach((header, headerIndex) => {
            const value = obj[header] || '';
            const formattedValue = formatValue(value);
            content += `    ${JSON.stringify(header)}: ${formattedValue}`;
            if (headerIndex < headers.length - 1) {
                content += ',';
            }
            content += '\n';
        });
        content += '  }';
        if (index < objects.length - 1) {
            content += ',';
        }
        content += '\n';
    });

    content += '];\n';
    return content;
}

// Usage function
function main() {
    const args = process.argv.slice(2);

    if (args.length !== 2) {
        console.log('Usage: node csv-to-js.js <input.csv> <output.js>');
        console.log('Example: node csv-to-js.js data.csv data-module.js');
        process.exit(1);
    }

    const [inputPath, outputPath] = args;

    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
        console.error(`Error: Input file '${inputPath}' does not exist`);
        process.exit(1);
    }

    // Create output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    convertCSVToJS(inputPath, outputPath)
        .then(() => {
            console.log('Conversion completed successfully!');
        })
        .catch((error) => {
            console.error('Error during conversion:', error.message);
            process.exit(1);
        });
}

// Run the script if called directly
if (require.main === module) {
    main();
}
