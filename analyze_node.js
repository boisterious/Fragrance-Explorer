const XLSX = require('xlsx');
const fs = require('fs');

try {
    console.log("Reading file...");
    const workbook = XLSX.readFile('../fragancias_completo.xlsx');
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Get headers (first row)
    const range = XLSX.utils.decode_range(sheet['!ref']);
    const headers = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ r: 0, c: C })];
        headers.push(cell ? cell.v : undefined);
    }

    console.log("Headers:", headers);

    // Get first few rows
    const data = XLSX.utils.sheet_to_json(sheet, { header: headers, range: 1, limit: 3 });
    console.log("First 3 rows:", JSON.stringify(data, null, 2));

    // Write to file
    fs.writeFileSync('analysis_node_result.txt', JSON.stringify({ headers, sample: data }, null, 2));
    console.log("Analysis saved to analysis_node_result.txt");

} catch (e) {
    console.error("Error:", e);
    fs.writeFileSync('analysis_node_result.txt', "Error: " + e.message);
}
