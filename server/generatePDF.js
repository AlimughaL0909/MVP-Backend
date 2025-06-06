const fs = require('fs');
const PDFDocument = require('pdfkit');

function generatePDF(summary, path) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(path));
  doc.fontSize(12).text(summary, { align: 'left' });
  doc.end();
}

module.exports = { generatePDF };
