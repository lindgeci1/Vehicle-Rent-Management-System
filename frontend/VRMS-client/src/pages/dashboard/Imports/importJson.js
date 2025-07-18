// importJson.js
/**
 * Imports a JSON file and parses it.
 * @param {File} file - The JSON file to import.
 * @returns {Promise} A promise that resolves with the parsed JSON data.
 */
export const importJson = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          resolve(Array.isArray(jsonData) ? jsonData : [jsonData]);
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
  