import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportAsPDF = (data, filename = 'export.pdf', excludedFields = []) => {
  if (!data || data.length === 0) return;

  // Filter out excluded fields
  const fields = Object.keys(data[0]).filter(field => !excludedFields.includes(field));

  // Setup columns with readable headers
  const columns = fields.map(field => ({
    header: field
      .replace(/([a-z])([A-Z])/g, '$1 $2')   // camelCase to Title Case
      .replace(/_/g, ' ')                   // snake_case to Title Case
      .replace(/\b\w/g, l => l.toUpperCase()), // capitalize words
    dataKey: field
  }));

  // Prepare the data rows
  const dataForPDF = data.map(row => {
    const newRow = {};
    fields.forEach(field => {
      let value = row[field] || '';
      if (Array.isArray(value)) {
        value = value.join(', ');
      } else if (typeof value === 'string') {
        value = value.replace(/\s*\/\s*/g, ', '); // Format "A / B" → "A, B"
      }
      newRow[field] = value;
    });
    return newRow;
  });

  const doc = new jsPDF({ orientation: 'landscape' }); // landscape for better horizontal space
  doc.setFontSize(16);
  doc.text('Exported Customers', 14, 20);

  autoTable(doc, {
    startY: 30,
    head: [columns.map(col => col.header)],
    body: dataForPDF.map(row => fields.map(f => row[f])),
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185], // optional: blue header
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });

  doc.save(filename);
};
