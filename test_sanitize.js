const kandidatRecord = { raw_text: "e \u0000 siensi" };
console.log("Original Stringify:", JSON.stringify(kandidatRecord));
const safeString = JSON.stringify(kandidatRecord).replace(/\\u0000/g, '').replace(/\\u000/g, '');
console.log("Safe Stringify:", safeString);
console.log("Parsed Safe:", JSON.parse(safeString));
