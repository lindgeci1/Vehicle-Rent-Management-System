// exportCsv.js
export const exportAsCSV = (data, filename = 'export.csv', excludedFields = []) => {
  if (!data || data.length === 0) return;
  
  // Create a new array of objects with the excluded fields removed
  const filteredData = data.map(item => {
    const newItem = { ...item };
    excludedFields.forEach(field => {
      delete newItem[field];
    });
    return newItem;
  });
  
  // Get header fields from the first filtered object
  const fields = Object.keys(filteredData[0]);
  
  const csvRows = [];
  // Add header row
  csvRows.push(fields.join(','));
  
  // Add each row of data
  filteredData.forEach(row => {
    const values = fields.map(field => {
      let val = row[field] ? row[field].toString() : '';
      return val; // No quotes
    });
    csvRows.push(values.join(','));
  });
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
