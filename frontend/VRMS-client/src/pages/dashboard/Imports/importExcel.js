// importExcel.js
import * as XLSX from 'xlsx';

/**
 * Imports an Excel file and converts the first worksheet to JSON.
 * @param {File} file - The Excel file to import.
 * @param {object} options - (Optional) Options to pass to XLSX.utils.sheet_to_json.
 * @returns {Promise} A promise that resolves with the JSON data.
 */
export const importExcel = (file, options = { defval: '' }) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        // Get the first sheet name
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Convert worksheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, options);
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};
