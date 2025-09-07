// controllers/app-controller.js
import * as Model from '../models/excel-reader.js';
import * as ChartView from '../views/chartView.js';
import * as MenuView from '../views/menuView.js';
import * as TableView from '../views/tableView.js';

let currentWorkbook = null;
let currentSheetData = null; // Guardaremos los datos de la hoja actual aquí
let monthColumnIndex = null; // Guardaremos el índice de la columna de meses

const initController = () => {
    document.getElementById('input-file').addEventListener('change', handleFileUpload);
    document.getElementById('btn-export-chart').addEventListener('click', ChartView.exportChartToPNG);

    // Listener para el nuevo botón de selección de gráficas
    document.getElementById('btn-select-charts').addEventListener('click', (event) => {
        event.preventDefault();
        handleShowChartsSection();
    });

    // Listeners para el cambio dinámico de tipo de gráfico
    document.getElementById('chart-type-selector').addEventListener('click', (event) => {
        handleChartTypeChange(event);
    });

    // Listener para el cambio de paleta de colores
    document.getElementById('palette-select').addEventListener('change', (event) => {
        rerenderChart();
    });

    // Listener para el cambio de ordenación
    document.getElementById('sort-order-select').addEventListener('change', () => {
        rerenderChart();
    });

    // Listeners para la edición de títulos
    const titleInputs = ['chart-title-input', 'chart-xaxis-title-input', 'chart-yaxis-title-input'];
    titleInputs.forEach(id => {
        // Usamos 'input' para una actualización en tiempo real al escribir
        document.getElementById(id).addEventListener('input', () => rerenderChart());
    });

    // Lógica para el menú desplegable de visualizaciones
    const menuButton = document.getElementById('btn-menu');
    const mainMenu = document.getElementById('main-menu');
    if (menuButton && mainMenu) {
        menuButton.addEventListener('click', () => {
            mainMenu.classList.toggle('hidden');
        });
    }

    // Lógica para el acordeón de opciones
    document.querySelectorAll('.accordion-header').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const icon = button.querySelector('svg');

            // Cerrar todos los demás acordeones para un comportamiento limpio
            document.querySelectorAll('.accordion-content').forEach(otherContent => {
                if (otherContent !== content && !otherContent.classList.contains('hidden')) {
                    otherContent.classList.add('hidden');
                    otherContent.previousElementSibling.querySelector('svg').classList.remove('rotate-180');
                }
            });

            content.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        });
    });
};

const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        currentWorkbook = await Model.readExcelFile(file);
        const sheetNames = Model.getSheetNames(currentWorkbook);
        MenuView.renderSheetMenu(sheetNames, handleSheetSelection);
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        alert('Hubo un error al procesar el archivo. Asegúrate de que es un archivo de Excel válido.');
    }
};

const handleSheetSelection = (sheetName) => {
    if (!currentWorkbook) return;
    currentSheetData = Model.getSheetData(currentWorkbook, sheetName); // Guardar datos

    // Renderizar la tabla
    const tableHTML = TableView.renderTable(currentSheetData);
    const tableContainer = document.getElementById('tabla-container');
    // Mostramos la tabla inmediatamente para dar feedback al usuario
    document.getElementById('seccion-visualizacion').classList.remove('hidden');
    document.getElementById('chart-container').classList.add('hidden'); // Ocultamos el contenedor del gráfico por ahora
    tableContainer.innerHTML = tableHTML;

    // Poblar los selectores de columnas para el gráfico
    if (currentSheetData && currentSheetData.length > 0) {
        const headers = currentSheetData[0];
        ChartView.renderColumnSelectors(headers);

        // Buscar y configurar el filtro de mes
        monthColumnIndex = headers.findIndex(header => header.toLowerCase().includes('mes'));
        if (monthColumnIndex !== -1) {
            const uniqueMonths = [...new Set(currentSheetData.slice(1).map(row => row[monthColumnIndex]))];
            ChartView.renderMonthFilter(uniqueMonths.sort());
            document.getElementById('month-filter-accordion').classList.remove('hidden');
            // Asignar el listener aquí, cuando el elemento ya existe
            document.getElementById('month-filter-select').addEventListener('change', () => {
                rerenderChart();
            });
        } else {
            ChartView.renderMonthFilter(null); // Ocultar el filtro si no se encuentra la columna
            document.getElementById('month-filter-accordion').classList.add('hidden');
        }
    }
};

const handleShowChartsSection = () => {
    // Oculta la sección de selección y muestra la de carga de archivos
    document.getElementById('seccion-seleccion').classList.add('hidden');
    document.getElementById('seccion-carga').classList.remove('hidden');
};

const handleChartTypeChange = (event) => {
    const button = event.target.closest('.chart-type-btn');
    if (!button) return;

    const chartType = button.getAttribute('data-chart-type');
    if (chartType && currentSheetData) {
        // Añadir una comprobación para guiar al usuario con los gráficos apilados
        if (chartType === 'stackedBar') {
            const valueSelect = document.getElementById('value-column-select');
            if (valueSelect.selectedOptions.length < 2) {
                alert('Para un gráfico de barras apiladas, por favor selecciona al menos dos columnas en la sección "Columnas para Valores (Eje Y)".');
            }
        }

        // Reutilizamos la lógica de renderizado, pero solo para actualizar el gráfico existente
        rerenderChart({ newChartType: chartType });
    }
};

const rerenderChart = (options = {}) => {
    if (!currentSheetData) return;

    const chartConfig = {
        labelColumnIndex: document.getElementById('label-column-select').value,
        valueColumnIndexes: Array.from(document.getElementById('value-column-select').selectedOptions).map(o => o.value),
        monthColumnIndex: monthColumnIndex,
        selectedMonth: document.getElementById('month-filter-select').value,
        sortOrder: document.getElementById('sort-order-select').value
    };

    const currentChartType = options.newChartType || (ChartView.getCurrentChart() ? ChartView.getCurrentChart().config.type : 'bar');
    const paletteName = document.getElementById('palette-select').value;

    MenuView.showVisualizationSection();
    document.getElementById('chart-container').classList.remove('hidden');
    ChartView.renderChart(currentChartType, currentSheetData, chartConfig, paletteName);
};

// Iniciar el controlador al cargar la página
initController();