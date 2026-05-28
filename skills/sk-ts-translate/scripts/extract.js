/**
 * Extract all unfinished entries from a Qt Linguist TS file.
 *
 * Outputs a JSON array of {src, trans} objects in the exact order they
 * appear in the file. This JSON is the input for apply.js.
 *
 * Usage:
 *   node extract.js <input.ts>
 *
 * Output (stdout):
 *   JSON array with source text and current (draft) translation for each
 *   unfinished entry.
 */

const fs = require('fs');

const inputPath = process.argv[2];

if (!inputPath) {
    console.error('Usage: node extract.js <input.ts>');
    process.exit(1);
}

let content;
try {
    content = fs.readFileSync(inputPath, 'utf-8');
} catch (e) {
    console.error('Error reading input file: ' + e.message);
    process.exit(1);
}

// Extract target language
const tsMatch = content.match(/<TS[^>]*language="([^"]*)"/);
const targetLang = tsMatch ? tsMatch[1] : 'unknown';
console.error('Target language:', targetLang);

// Parse message blocks
const msgRegex = /<message>\s*([\s\S]*?)<\/message>/g;
let match;
const entries = [];
let totalMessages = 0;

while ((match = msgRegex.exec(content)) !== null) {
    totalMessages++;
    const block = match[1];
    if (block.includes('type="unfinished"')) {
        const srcMatch = block.match(/<source>([\s\S]*?)<\/source>/);
        const transMatch = block.match(/<translation[^>]*>([\s\S]*?)<\/translation>/);
        const locMatch = block.match(/<location[^>]*\/>/);
        entries.push({
            source: srcMatch ? srcMatch[1] : '(none)',
            translation: transMatch ? transMatch[1] : '',
            empty: !transMatch || transMatch[1].trim() === '',
            location: locMatch ? locMatch[0] : ''
        });
    }
}

console.error('Total messages:', totalMessages);
console.error('Unfinished entries:', entries.length);
console.error('  Empty:', entries.filter(e => e.empty).length);
console.error('  Draft:', entries.filter(e => !e.empty).length);
console.error('');

// Output JSON to stdout (array of {src, trans} for apply.js)
const output = entries.map(e => ({
    src: e.source,
    trans: e.translation
}));

console.log(JSON.stringify(output, null, 2));
