// exportJson.js
export const exportAsJSON = (data, filename = 'export.json', excludedFields = []) => {
    if (!data || data.length === 0) return;
    
    // Filter each object to exclude fields provided in the excludedFields array.
    const filteredData = data.map(item => {
      const newItem = {};
      Object.keys(item).forEach(key => {
        if (!excludedFields.includes(key)) {
          newItem[key] = item[key];
        }
      });
      return newItem;
    });
    
    const jsonString = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  