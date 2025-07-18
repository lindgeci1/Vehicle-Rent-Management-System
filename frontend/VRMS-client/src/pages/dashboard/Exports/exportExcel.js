// exportExcel.js
import * as XLSX from 'xlsx';

export const exportAsExcel = (data, filename = 'export.xlsx', excludedFields = []) => {
  if (!data || data.length === 0) return;

  // Remove unwanted fields from each object
  const dataForExcel = data.map(row => {
    const newObj = {};
    Object.keys(row).forEach(key => {
      if (!excludedFields.includes(key)) {
        newObj[key] = row[key];
      }
    });
    return newObj;
  });

  // Create worksheet and workbook then export
  const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, filename);
};
