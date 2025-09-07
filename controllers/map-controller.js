// controllers/map-controller.js
import * as Model from '../models/excel-reader.js';

let map = null;
let sheetData = null; // Para almacenar los datos del archivo Excel
let markers = {}; // Para almacenar los marcadores por nombre para una búsqueda fácil

const initMap = () => {
    // Inicializar el mapa centrado en una ubicación genérica
    // 1. Definir las diferentes capas de mapa base
    const standardMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        crossOrigin: 'anonymous'
    });

    const satelliteMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        crossOrigin: 'anonymous'
    });

    const darkModeMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        crossOrigin: 'anonymous'
    });

    const topoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        crossOrigin: 'anonymous'
    });

    const streetsMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012',
        crossOrigin: 'anonymous'
    });

    // 2. Inicializar el mapa con la capa estándar por defecto
    map = L.map('map', {
        center: [4.57, -74.29], // Centrado en Colombia
        zoom: 5,
        layers: [standardMap] // Añadir la capa por defecto aquí
    });

    // 3. Crear un objeto para el control de capas
    const baseMaps = {
        "Estándar": standardMap,
        "Calles (Detallado)": streetsMap,
        "Satélite": satelliteMap,
        "Topográfico": topoMap,
        "Modo Oscuro": darkModeMap
    };

    // 4. Añadir el control de capas al mapa
    L.control.layers(baseMaps).addTo(map);
};

const handleMapFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const workbook = await Model.readExcelFile(file);
        const sheetName = workbook.SheetNames[0];
        // Usamos sheet_to_json para facilitar el acceso por nombre de columna
        sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (sheetData.length > 0) {
            const headers = Object.keys(sheetData[0]);
            renderColumnSelectors(headers);
        }
    } catch (error) {
        console.error('Error al procesar el archivo para el mapa:', error);
        alert('Hubo un error. Asegúrate de que el archivo es válido y contiene las columnas "latitud" y "longitud".');
    }
};

const renderColumnSelectors = (headers) => {
    const latSelect = document.getElementById('lat-column-select');
    const lonSelect = document.getElementById('lon-column-select');
    const nameSelect = document.getElementById('name-column-select');
    const optionsContainer = document.getElementById('map-options-container');

    latSelect.innerHTML = '';
    lonSelect.innerHTML = '';
    nameSelect.innerHTML = '';

    headers.forEach(header => {
        const option = document.createElement('option');
        option.value = header;
        option.textContent = header;
        latSelect.appendChild(option.cloneNode(true));
        lonSelect.appendChild(option.cloneNode(true));
        nameSelect.appendChild(option);
    });

    // Intentar pre-seleccionar columnas comunes
    latSelect.value = headers.find(h => h.toLowerCase().includes('lat')) || headers[0];
    lonSelect.value = headers.find(h => h.toLowerCase().includes('lon')) || headers[1];
    nameSelect.value = headers.find(h => h.toLowerCase().includes('nom') || h.toLowerCase().includes('name')) || headers[0];

    optionsContainer.classList.remove('hidden');
};

const plotPointsOnMap = () => {
    if (!map || !sheetData) return;

    // Limpiar marcadores anteriores del mapa y de nuestro objeto de búsqueda
    Object.values(markers).forEach(marker => map.removeLayer(marker));
    markers = {};

    const latColumn = document.getElementById('lat-column-select').value;
    const lonColumn = document.getElementById('lon-column-select').value;
    const nameColumn = document.getElementById('name-column-select').value;
    const markerColor = document.getElementById('marker-color-select').value;
    const markerIcon = document.getElementById('marker-icon-select').value;

    sheetData.forEach(row => {
        const lat = row[latColumn];
        const lon = row[lonColumn];
        const name = row[nameColumn] || 'Punto sin nombre';

        if (lat !== undefined && lon !== undefined) {
            // Crear un icono personalizado con Leaflet.AwesomeMarkers
            const customIcon = L.AwesomeMarkers.icon({
                icon: markerIcon,
                markerColor: markerColor,
                prefix: 'fa', // Usar el prefijo de Font Awesome
                iconColor: 'white'
            });

            const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
            // Añadir un popup con el nombre del punto
            marker.bindPopup(`<b>${name}</b><br>Lat: ${lat}, Lon: ${lon}`);

            // Guardar el marcador usando su nombre como clave (en minúsculas para una búsqueda insensible a mayúsculas)
            markers[name.toLowerCase()] = marker;
        }
    });

    // Mostrar la barra de búsqueda y exportación ahora que los puntos están en el mapa
    document.getElementById('map-actions-container').classList.remove('hidden');
};

const handleExportMap = () => {
    if (!map) {
        alert('Primero debes graficar los puntos en el mapa.');
        return;
    }

    const mapContainer = document.getElementById('map');
    
    // Ocultar temporalmente los controles de Leaflet para una captura más limpia
    const leafletControls = mapContainer.querySelectorAll('.leaflet-control-container');
    leafletControls.forEach(control => control.style.display = 'none');

    // Usar html2canvas para tomar una "captura de pantalla" del div del mapa
    html2canvas(mapContainer, {
        useCORS: true, // Indicar a html2canvas que intente cargar imágenes de otros orígenes
        allowTaint: true, // Permite "ensuciar" el canvas, a veces necesario
        logging: false // Desactivar logs en la consola
    }).then(canvas => {
        // Volver a mostrar los controles de Leaflet
        leafletControls.forEach(control => control.style.display = 'block');

        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'mapa.png';
        link.click();
    }).catch(err => {
        // Volver a mostrar los controles de Leaflet incluso si hay un error
        leafletControls.forEach(control => control.style.display = 'block');
        console.error('Error al exportar el mapa con html2canvas:', err);
        alert('Hubo un error al exportar el mapa. Esto puede deberse a restricciones de seguridad del navegador.');
    });
};

const handleSearch = () => {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    if (!searchTerm) return;

    const marker = markers[searchTerm];

    if (marker) {
        map.setView(marker.getLatLng(), 15); // Centrar y hacer zoom en el punto
        marker.openPopup(); // Abrir su popup
    } else {
        alert('Punto no encontrado. Asegúrate de escribir el nombre exacto.');
    }
};

// Iniciar el controlador del mapa
initMap();
document.getElementById('input-file-map').addEventListener('change', handleMapFileUpload);
document.getElementById('btn-plot-map').addEventListener('click', plotPointsOnMap);
document.getElementById('btn-export-map').addEventListener('click', handleExportMap);
document.getElementById('btn-search-map').addEventListener('click', handleSearch);
document.getElementById('search-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// Lógica para el menú desplegable de visualizaciones
const menuButton = document.getElementById('btn-menu');
const mainMenu = document.getElementById('main-menu');
if (menuButton && mainMenu) {
    menuButton.addEventListener('click', () => {
        mainMenu.classList.toggle('hidden');
    });
}