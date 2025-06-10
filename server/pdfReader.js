const fs = require('fs');
const pdf = require('pdf-parse');

async function getFirstTwoLines(pdfPath) {
    try {
        const dataBuffer = fs.readFileSync(pdfPath);
        const data = await pdf(dataBuffer);
        const lines = data.text.split('\n').filter(line => line.trim());
        // Skip first line and get next three lines (index 1, 2, and 3)
        return lines.slice(1, 4).join(' ');
    } catch (error) {
        console.error('Error reading PDF:', error);
        return 'PDF content unavailable';
    }
}

module.exports = { getFirstTwoLines };