/**
 * Apply translations to a Qt Linguist TS file.
 *
 * Reads translations from a JSON mapping file and applies them to the TS file,
 * replacing only <translation type="unfinished"> elements while preserving
 * all other XML formatting exactly.
 *
 * Usage:
 *   node apply.js <input.ts> <translations.json> [output.ts]
 *
 * translations.json format:
 *   An array of {src, trans} objects in the exact order the unfinished entries
 *   appear in the TS file.
 *
 *   [
 *     {"src": "主轴校正", "trans": "Correzione mandrino"},
 *     {"src": "设为基准", "trans": "Imposta come riferimento"},
 *     ...
 *   ]
 *
 * If output.ts is omitted, defaults to <input>_translated.ts
 */

const fs = require('fs');

const inputPath = process.argv[2];
const mappingPath = process.argv[3];
const outputPath = process.argv[4] || inputPath.replace(/\.ts$/i, '_translated.ts');

if (!inputPath || !mappingPath) {
    console.error('Usage: node apply.js <input.ts> <translations.json> [output.ts]');
    process.exit(1);
}

if (outputPath === inputPath) {
    console.error('Error: output path must differ from input path.');
    console.error('  Source files must not be modified. Use the default _translated.ts suffix.');
    process.exit(1);
}

let content, translations;
try {
    content = fs.readFileSync(inputPath, 'utf-8');
    translations = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
} catch (e) {
    console.error('Error reading input files: ' + e.message);
    process.exit(1);
}

if (!Array.isArray(translations)) {
    console.error('Error: translations.json must be a JSON array');
    process.exit(1);
}

console.log('Input file:', inputPath);
console.log('Translations to apply:', translations.length);

// Find all message blocks containing type="unfinished"
const msgRegex = /<message>\s*([\s\S]*?)<\/message>/g;
let idx = 0;
let replacedCount = 0;
const errors = [];

const result = content.replace(msgRegex, (fullMatch) => {
    if (fullMatch.includes('type="unfinished"')) {
        if (idx >= translations.length) {
            errors.push('Extra unfinished entry at position ' + idx + ' (beyond ' + translations.length + ' translations)');
            return fullMatch;
        }

        const t = translations[idx];

        // Verify source matches expected
        const srcMatch = fullMatch.match(/<source>([\s\S]*?)<\/source>/);
        const actualSource = srcMatch ? srcMatch[1] : null;

        if (actualSource !== t.src) {
            errors.push(
                'Source mismatch at index ' + idx + ':\n' +
                '  expected: ' + JSON.stringify(t.src).substring(0, 60) + '\n' +
                '  actual:   ' + JSON.stringify(actualSource).substring(0, 60)
            );
            idx++;
            return fullMatch;
        }

        // Replace ONLY the translation element — preserve everything else
        // Use function replacer to avoid $ injection (e.g. $&, $1 in translation text)
        const newMatch = fullMatch.replace(
            /<translation[^>]*type="unfinished"[^>]*>([\s\S]*?)<\/translation>/,
            () => '<translation>' + t.trans + '</translation>'
        );

        replacedCount++;
        idx++;
        return newMatch;
    }
    return fullMatch;
});

console.log('Unfinished entries found:', idx);
console.log('Replacements made:', replacedCount);

if (errors.length > 0) {
    console.error('\nERRORS (' + errors.length + '):');
    errors.forEach(e => console.error('  ' + e));
    console.error('\nFile NOT written — fix the mapping.');
    process.exit(1);
}

fs.writeFileSync(outputPath, result, 'utf-8');
console.log('Output:', outputPath);

// Final check
const remaining = (result.match(/type="unfinished"/g) || []).length;
console.log('Remaining unfinished:', remaining);

if (remaining > 0) {
    console.error('WARNING: Some unfinished entries were not processed!');
    process.exit(1);
}

// Verify file size is reasonable
const inputSize = fs.statSync(inputPath).size;
const outputSize = fs.statSync(outputPath).size;
const delta = outputSize - inputSize;
console.log('Size delta:', (delta > 0 ? '+' : '') + delta, 'bytes');
