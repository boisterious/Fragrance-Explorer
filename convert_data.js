const XLSX = require('xlsx');
const fs = require('fs');

try {
    console.log("Reading file...");
    const workbook = XLSX.readFile('../fragancias_completo.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(sheet);

    // Create JS file content
    const jsContent = `window.FRAGRANCE_DATA = ${JSON.stringify(data)};`;

    fs.writeFileSync('data.js', jsContent);
    console.log("Data converted to data.js");

} catch (e) {
    console.error("Error:", e);
}
