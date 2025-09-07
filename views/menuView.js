// views/menuView.js
const sheetSelectorContainer = document.getElementById('sheet-selector-container');
const tablaContainer = document.getElementById('tabla-container');
const seccionCarga = document.getElementById('seccion-carga');
const seccionVisualizacion = document.getElementById('seccion-visualizacion');

export const renderSheetMenu = (sheetNames, onSelect) => {
    sheetSelectorContainer.innerHTML = ''; // Limpiar el contenedor anterior

    if (sheetNames.length > 0) {
        sheetSelectorContainer.classList.remove('hidden');

        // Crear la etiqueta
        const label = document.createElement('label');
        label.htmlFor = 'sheet-select';
        label.textContent = 'Selecciona una hoja:';
        label.className = 'block text-lg font-semibold mb-2';
        sheetSelectorContainer.appendChild(label);

        // Crear el elemento <select>
        const select = document.createElement('select');
        select.id = 'sheet-select';
        select.className = 'w-full p-2 border border-gray-300 rounded-md';

        // Añadir una opción por defecto
        const defaultOption = document.createElement('option');
        defaultOption.textContent = 'Elige una opción...';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        // Añadir una opción por cada hoja
        sheetNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });

        // Añadir el evento 'change' para manejar la selección
        select.addEventListener('change', (event) => {
            const selectedSheet = event.target.value;
            onSelect(selectedSheet);
        });

        sheetSelectorContainer.appendChild(select);
    }
};

export const showLoadingSection = () => {
    seccionCarga.classList.remove('hidden');
    seccionVisualizacion.classList.add('hidden');
    tablaContainer.innerHTML = '';
};

export const showVisualizationSection = () => {
    seccionCarga.classList.add('hidden');
    seccionVisualizacion.classList.remove('hidden');
};