// views/chartView.js

// Registrar el plugin de etiquetas de datos globalmente
Chart.register(ChartDataLabels);

let currentChart = null;
const chartOptionsContainer = document.getElementById('chart-options-container');
const labelSelect = document.getElementById('label-column-select');
const valueSelect = document.getElementById('value-column-select');

export const renderColumnSelectors = (headers) => {
    labelSelect.innerHTML = '';
    valueSelect.innerHTML = '';

    headers.forEach((header, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = header;
        labelSelect.appendChild(option.cloneNode(true));
        valueSelect.appendChild(option.cloneNode(true));
    });

    // Por defecto, seleccionamos la primera columna para etiquetas y la segunda para valores
    if (headers.length > 1) {
        labelSelect.selectedIndex = 0;
        valueSelect.options[1].selected = true;
    }
    chartOptionsContainer.classList.remove('hidden');
};

export const renderMonthFilter = (uniqueMonths) => {
    const monthFilterSelect = document.getElementById('month-filter-select');
    monthFilterSelect.innerHTML = '';

    if (uniqueMonths && uniqueMonths.length > 0) {
        // Opción para ver todos los meses
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = 'Todos los Meses';
        monthFilterSelect.appendChild(allOption);

        uniqueMonths.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            monthFilterSelect.appendChild(option);
        });
    }
};
/**
 * Prepara los datos del formato de la hoja de cálculo (array de arrays)
 * al formato que necesita Chart.js ({ labels: [], datasets: [{ data: [] }] }).
 */

const PALETTES = {
    default: [
        { bg: 'rgba(54, 162, 235, 0.6)', border: 'rgba(54, 162, 235, 1)' }, // Blue
        { bg: 'rgba(255, 99, 132, 0.6)', border: 'rgba(255, 99, 132, 1)' }, // Red
        { bg: 'rgba(75, 192, 192, 0.6)', border: 'rgba(75, 192, 192, 1)' }, // Teal
        { bg: 'rgba(255, 206, 86, 0.6)', border: 'rgba(255, 206, 86, 1)' }, // Yellow
        { bg: 'rgba(153, 102, 255, 0.6)', border: 'rgba(153, 102, 255, 1)' }, // Purple
        { bg: 'rgba(255, 159, 64, 0.6)', border: 'rgba(255, 159, 64, 1)' }  // Orange
    ],
    ocean: [
        { bg: 'rgba(0, 102, 153, 0.6)', border: 'rgba(0, 102, 153, 1)' },
        { bg: 'rgba(0, 153, 204, 0.6)', border: 'rgba(0, 153, 204, 1)' },
        { bg: 'rgba(102, 204, 255, 0.6)', border: 'rgba(102, 204, 255, 1)' },
        { bg: 'rgba(0, 204, 153, 0.6)', border: 'rgba(0, 204, 153, 1)' },
        { bg: 'rgba(204, 255, 255, 0.6)', border: 'rgba(204, 255, 255, 1)' },
        { bg: 'rgba(153, 204, 204, 0.6)', border: 'rgba(153, 204, 204, 1)' }
    ],
    sunset: [
        { bg: 'rgba(255, 87, 34, 0.6)', border: 'rgba(255, 87, 34, 1)' },
        { bg: 'rgba(255, 152, 0, 0.6)', border: 'rgba(255, 152, 0, 1)' },
        { bg: 'rgba(255, 193, 7, 0.6)', border: 'rgba(255, 193, 7, 1)' },
        { bg: 'rgba(255, 235, 59, 0.6)', border: 'rgba(255, 235, 59, 1)' },
        { bg: 'rgba(121, 85, 72, 0.6)', border: 'rgba(121, 85, 72, 1)' },
        { bg: 'rgba(244, 67, 54, 0.6)', border: 'rgba(244, 67, 54, 1)' }
    ],
    forest: [
        { bg: 'rgba(46, 125, 50, 0.6)', border: 'rgba(46, 125, 50, 1)' },
        { bg: 'rgba(102, 187, 106, 0.6)', border: 'rgba(102, 187, 106, 1)' },
        { bg: 'rgba(165, 214, 167, 0.6)', border: 'rgba(165, 214, 167, 1)' },
        { bg: 'rgba(139, 195, 74, 0.6)', border: 'rgba(139, 195, 74, 1)' },
        { bg: 'rgba(85, 139, 47, 0.6)', border: 'rgba(85, 139, 47, 1)' },
        { bg: 'rgba(27, 94, 32, 0.6)', border: 'rgba(27, 94, 32, 1)' }
    ]
};

/**
 * Genera un array de colores con opacidad variable basado en los valores de los datos.
 * @param {number[]} datasetData - El array de valores numéricos.
 * @param {string} baseColorRGB - El color base en formato "R, G, B".
 * @returns {string[]} Un array de colores en formato "rgba(...)".
 */
const generateSequentialColors = (datasetData, baseColorRGB) => {
    const dataMin = Math.min(...datasetData);
    const dataMax = Math.max(...datasetData);
    const range = dataMax - dataMin;

    if (range === 0) {
        return datasetData.map(() => `rgba(${baseColorRGB}, 0.7)`);
    }

    return datasetData.map(value => {
        const intensity = (value - dataMin) / range; // Normaliza el valor de 0 a 1
        const opacity = 0.3 + (intensity * 0.7); // Calcula la opacidad de 0.3 a 1.0
        return `rgba(${baseColorRGB}, ${opacity})`;
    });
};

const prepareChartData = (chartType, data, { labelColumnIndex, valueColumnIndexes, monthColumnIndex, selectedMonth, sortOrder, isStacked }, paletteName = 'default') => {
    // Omitimos la primera fila (encabezados)
    const [headers, ...originalRows] = data;
    const chartColors = PALETTES[paletteName] || PALETTES.default;

    // --- Lógica de Filtrado por Mes ---
    let rows = originalRows;
    if (monthColumnIndex !== null && selectedMonth && selectedMonth !== 'all') {
        rows = originalRows.filter(row => {
            // Comparamos como strings para evitar problemas de tipo
            return String(row[monthColumnIndex]) === String(selectedMonth);
        });
    }
    // --- Fin de la Lógica de Filtrado ---


    // --- Lógica de Agregación ---
    const aggregationMap = new Map();

    rows.forEach(row => {
        const label = row[labelColumnIndex];
        if (!aggregationMap.has(label)) {
            // Si la etiqueta no existe, la inicializamos con un array de ceros,
            // uno por cada columna de valor que estamos agregando.
            aggregationMap.set(label, new Array(valueColumnIndexes.length).fill(0));
        }

        const aggregatedValues = aggregationMap.get(label);
        valueColumnIndexes.forEach((valueIndex, i) => {
            const value = parseFloat(row[valueIndex]) || 0;
            aggregatedValues[i] += value;
        });
    });

    let aggregatedLabels = Array.from(aggregationMap.keys());
    let finalAggregatedValues = Array.from(aggregationMap.values());
    // --- Fin de la Lógica de Agregación ---

    // --- Lógica de Ordenación ---
    if (sortOrder !== 'none' && aggregatedLabels.length > 0) {
        const combinedData = aggregatedLabels.map((label, index) => ({
            label: label,
            values: finalAggregatedValues[index]
        }));

        // Ordenar basado en la primera columna de valor seleccionada
        const sortIndex = 0;
        combinedData.sort((a, b) => {
            return sortOrder === 'desc' ? b.values[sortIndex] - a.values[sortIndex] : a.values[sortIndex] - b.values[sortIndex];
        });

        aggregatedLabels = combinedData.map(d => d.label);
        finalAggregatedValues = combinedData.map(d => d.values);
    }
    // --- Fin de la Lógica de Ordenación ---
    const datasets = valueColumnIndexes.map((valueIndex, i) => {
        const datasetData = finalAggregatedValues.map(values => values[i]);
        const color = chartColors[i % chartColors.length];

        // Para gráficos circulares, el color es un array. Para otros, es un string.
        const backgroundColor = (chartType === 'pie' || chartType === 'doughnut')
            ? aggregatedLabels.map((_, j) => chartColors[j % chartColors.length].bg)
            : (paletteName === 'sequential' && !isStacked ? generateSequentialColors(datasetData, '54, 162, 235') : color.bg);
        
        const borderColor = paletteName === 'sequential' ? 'rgba(54, 162, 235, 1)' : color.border;

        // Los gráficos circulares solo deben tener un dataset.
        // Si es circular y no es el primer dataset, retornamos null para filtrarlo después.
        if (paletteName === 'sequential' && (chartType === 'pie' || chartType === 'doughnut')) {
            // La paleta secuencial en gráficos circulares usa el mismo array de colores que los de barras
            // No necesita un tratamiento especial aquí, ya que backgroundColor ya es un array.
        }
        if ((chartType === 'pie' || chartType === 'doughnut') && i > 0) {
            return null;
        }

        return {
            label: headers[valueIndex] || `Valores ${i + 1}`,
            data: datasetData,
            backgroundColor: backgroundColor,
            borderColor: borderColor,
            borderWidth: 1,
        };
    }).filter(ds => ds !== null); // Filtramos los datasets nulos

    return {
        labels: aggregatedLabels,
        datasets: datasets,
    };
};

export const renderChart = (chartType, data, { labelColumnIndex, valueColumnIndexes, monthColumnIndex, selectedMonth, sortOrder }, paletteName) => {
    const ctx = document.getElementById('myChart').getContext('2d');
    
    const isStacked = chartType === 'stackedBar';
    const finalChartType = isStacked ? 'bar' : chartType;

    const chartData = prepareChartData(finalChartType, data, { labelColumnIndex, valueColumnIndexes, monthColumnIndex, selectedMonth, sortOrder, isStacked }, paletteName);
    // Generar título dinámico basado en las columnas seleccionadas
    const headers = data[0];
    const labelName = headers[labelColumnIndex];
    const valueNames = valueColumnIndexes.map(index => headers[index]);
    // Formato del título: "Valores vs. Etiquetas" (ej. "Ventas y Ganancias vs. Mes")
    const titleText = `${valueNames.join(' y ')} vs. ${labelName}`;

    // Títulos para los ejes
    const xAxisTitle = labelName;
    const yAxisTitle = valueNames.length > 1 ? 'Valores Agregados' : valueNames[0] || 'Valor';

    const chartOptions = {
        // ... (se llenará más abajo)
    };

    // Si el gráfico ya existe, lo actualizamos. Si no, lo creamos.
    if (currentChart) {
        currentChart.config.type = finalChartType;
        currentChart.data = chartData;

        // Actualizar los títulos desde los inputs
        currentChart.options.plugins.title.text = document.getElementById('chart-title-input').value;
        currentChart.options.scales.x.title.text = document.getElementById('chart-xaxis-title-input').value;
        currentChart.options.scales.y.title.text = document.getElementById('chart-yaxis-title-input').value;

        // Habilitar o deshabilitar los ejes según el tipo de gráfico
        const showAxes = !(finalChartType === 'pie' || finalChartType === 'doughnut');
        currentChart.options.scales.x.display = showAxes;
        currentChart.options.scales.y.display = showAxes;
        currentChart.options.scales.x.stacked = isStacked;
        currentChart.options.scales.y.stacked = isStacked;

        currentChart.update();
    } else {
        // Poblar los inputs con los títulos generados por defecto
        document.getElementById('chart-title-input').value = titleText;
        document.getElementById('chart-xaxis-title-input').value = xAxisTitle;
        document.getElementById('chart-yaxis-title-input').value = yAxisTitle;

        // Asignar plugins solo en la creación inicial
        chartOptions.plugins = {
            legend: { position: 'top' },
            title: {
                display: true,
                text: titleText,
                font: {
                    size: 18
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            datalabels: {
                formatter: (value, context) => {
                    const chartType = context.chart.config.type;
                    // Para gráficos circulares, mostrar valor y porcentaje
                    if (chartType === 'pie' || chartType === 'doughnut') {
                        const total = context.chart.data.datasets[0].data.reduce((sum, data) => sum + (data || 0), 0);
                        const percentage = (value / total * 100).toFixed(1);
                        if (percentage < 3) return ''; // Ocultar etiquetas pequeñas para no saturar
                        return `${value}\n(${percentage}%)`;
                    }
                    // Para otros gráficos, solo mostrar el valor si no es cero
                    return value !== 0 ? value : '';
                },
                color: '#000',
                font: {
                    weight: 'bold'
                },
                anchor: 'center'
            },
        };

        // Asignar opciones de escalas solo en la creación inicial
        chartOptions.responsive = true;
        chartOptions.maintainAspectRatio = false;

        const showAxes = !(finalChartType === 'pie' || finalChartType === 'doughnut');
        chartOptions.scales = {
            x: { 
                display: showAxes,
                stacked: isStacked,
                title: { display: true, text: xAxisTitle, font: { size: 14 } } },
            y: { 
                display: showAxes,
                stacked: isStacked,
                title: { display: true, text: yAxisTitle, font: { size: 14 } } }
        };

        // Creamos la nueva instancia del gráfico
        currentChart = new Chart(ctx, {
            type: finalChartType, // 'bar', 'pie', 'line', etc.
            data: chartData,
            options: chartOptions
        });
    }
};

export const exportChartToPNG = () => {
    if (!currentChart) {
        alert('Primero debes generar un gráfico para poder exportarlo.');
        return;
    }

    // --- Solución para el fondo blanco en la exportación ---
    const canvas = currentChart.canvas;
    const ctx = canvas.getContext('2d');

    // Guardar el estado actual del canvas
    ctx.save();

    // Dibujar un fondo blanco detrás del gráfico existente
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Obtener la imagen ahora con el fondo blanco
    const image = currentChart.toBase64Image();

    // Restaurar el estado del canvas para que el gráfico en pantalla no se vea afectado
    ctx.restore();
    // --- Fin de la solución ---

    const link = document.createElement('a');
    link.href = image; // Usar la imagen con el fondo
    link.download = 'grafico.png';
    
    // Simular un clic en el enlace para iniciar la descarga
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const getCurrentChart = () => {
    return currentChart;
};