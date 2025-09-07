// views/tableView.js
export const renderTable = (data) => {
    if (!data || data.length === 0) return '';
    
    // Suponemos que la primera fila son los encabezados
    const [headers, ...rows] = data;
    
    // La clase 'table-auto' o 'table-fixed' puede ser útil dependiendo del contenido
    let html = `<table class="min-w-full divide-y divide-gray-200">`; 
    
    // Encabezados de la tabla
    // Hacemos el encabezado "sticky" para que permanezca visible al hacer scroll
    html += `<thead class="bg-gray-100 sticky top-0 z-10"><tr>`;
    headers.forEach(header => {
        html += `<th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">${header}</th>`;
    });
    html += `</tr></thead>`;
    
    // Cuerpo de la tabla
    // Eliminamos 'divide-y' del tbody para controlar el borde en las filas
    html += `<tbody class="bg-white">`;
    rows.forEach(row => {
        // Añadimos clases para el efecto hover y el zebra-striping (odd:bg-white even:bg-gray-50)
        html += `<tr class="border-b border-gray-200 hover:bg-blue-50 transition-colors duration-150 ease-in-out">`;
        row.forEach(cell => {
            html += `<td class="px-4 py-2 whitespace-nowrap text-sm text-gray-700">${cell}</td>`;
        });
        html += `</tr>`;
    });
    html += `</tbody></table>`;
    
    return html;
};