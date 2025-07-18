// importCsv.js
/**
 * Imports a CSV file and converts it to JSON.
 * @param {File} file - The CSV file to import.
 * @returns {Promise} A promise that resolves with the parsed JSON data.
 */
export const importCsv = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').filter(line => line.trim() !== '');
          const headers = lines[0].split(',').map(h => h.trim());
  
          const jsonData = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            return headers.reduce((obj, header, i) => {
              obj[header] = values[i] || '';
              return obj;
            }, {});
          });
  
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    });
  };
  