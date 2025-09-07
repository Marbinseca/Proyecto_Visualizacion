// models/excel-reader.js

export const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            resolve(workbook);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsArrayBuffer(file);
    });
};

export const getSheetNames = (workbook) => {
    return workbook.SheetNames;
};

export const getSheetData = (workbook, sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    // Convertir la hoja a un array de arrays para facilitar la manipulación
    return XLSX.utils.sheet_to_json(worksheet, { header: 1 });
};