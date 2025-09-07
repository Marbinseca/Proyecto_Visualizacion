# Visualizador de Datos Interactivo

Una aplicación web del lado del cliente diseñada para transformar datos de archivos Excel en visualizaciones dinámicas e interactivas, incluyendo una amplia gama de gráficos y mapas geoespaciales.

## Características Principales

La aplicación se divide en dos herramientas principales:

1.  **Visualización de Gráficas**: Para el análisis de datos tabulares.
2.  **Visualización de Mapas**: Para la representación de datos geoespaciales.

---

### 📊 Visualización de Gráficas

Esta sección permite a los usuarios cargar un archivo Excel y generar gráficos personalizables al instante.

#### Carga y Selección de Datos
- **Carga de Archivos Excel**: Soporte para archivos `.xlsx` y `.xls`.
- **Selección de Hojas**: Interfaz para elegir la hoja de cálculo a visualizar dentro del archivo.
- **Tabla de Datos Interactiva**: Muestra los datos crudos en una tabla con encabezado fijo y resaltado de filas al pasar el cursor.

#### Creación y Personalización de Gráficos
- **Selección de Ejes**: Permite elegir qué columnas usar para las etiquetas (Eje X) y los valores (Eje Y).
- **Múltiples Series de Datos**: Soporte para seleccionar varias columnas de valores para comparaciones.
- **Agregación Automática**: Agrupa y suma automáticamente los valores para etiquetas repetidas, proporcionando una vista consolidada.
- **Variedad de Gráficos**:
  - Gráfico de Barras
  - Gráfico de Barras Apiladas
  - Gráfico de Líneas
  - Gráfico Circular (Pastel)
  - Gráfico de Anillo (Doughnut)
- **Control de Ordenación**: Ordena los datos del gráfico de mayor a menor (o viceversa) basándose en la primera columna de valor.

#### Estilo y Presentación
- **Paletas de Colores**: Incluye múltiples paletas predefinidas (Moderno, Océano, Atardecer, Bosque).
- **Paleta Secuencial**: Una paleta de colores degradada que colorea las barras según la magnitud de su valor, resaltando visualmente los datos más importantes.
- **Títulos Editables**: Permite editar en tiempo real el título principal del gráfico y los títulos de los ejes X e Y a través de campos de texto en el panel de opciones.
- **Etiquetas de Datos**: Muestra los valores directamente sobre cada barra o porción del gráfico. Para gráficos circulares, también muestra el porcentaje correspondiente.
- **Ejes Inteligentes**: Oculta automáticamente los ejes cartesianos (X e Y) para gráficos circulares y de anillo.

#### Filtrado y Exportación
- **Filtro por Mes**: Detecta automáticamente una columna de "mes" y permite filtrar los datos para un mes específico.
- **Exportación a PNG**: Exporta el gráfico actual como una imagen PNG de alta calidad con fondo blanco.

---

### 🗺️ Visualización de Mapas

Esta sección está dedicada a la representación de puntos geográficos a partir de un archivo Excel que contenga coordenadas.

#### Carga y Configuración
- **Carga de Archivo de Coordenadas**: Permite subir un archivo Excel que contenga datos de latitud y longitud.
- **Selección de Columnas**: Interfaz para asignar manualmente las columnas de **Latitud**, **Longitud** y **Nombre del Punto**. El sistema intenta pre-seleccionar las columnas basándose en nombres comunes.

#### Capas y Estilos de Mapa
- **Múltiples Capas Base**: Ofrece una variedad de mapas de fondo para elegir:
  - Estándar (OpenStreetMap)
  - Calles (Detallado)
  - Satélite
  - Topográfico
  - Modo Oscuro
- **Control de Capas**: Un control interactivo en el mapa permite cambiar entre las diferentes capas base al instante.

#### Marcadores y Personalización
- **Marcadores Personalizables**: Permite cambiar el **color** y el **icono** (usando Font Awesome) de los marcadores en el mapa.
- **Popups Informativos**: Al hacer clic en un marcador, se muestra una ventana emergente con el nombre del punto y sus coordenadas.

#### Interacción y Exportación
- **Búsqueda de Puntos**: Una barra de búsqueda permite encontrar un punto por su nombre, centrando el mapa en su ubicación y abriendo su popup.
- **Exportación a PNG**: Exporta la vista actual del mapa (incluyendo marcadores y capa base) como una imagen PNG.

---

## 🚀 Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3 (con **Tailwind CSS**)
- **Lenguaje**: JavaScript (Módulos ES6)
- **Librerías Principales**:
  - **SheetJS (xlsx)**: Para la lectura y parseo de archivos Excel.
  - **Chart.js**: Para la creación de gráficos dinámicos.
  - **chartjs-plugin-datalabels**: Para mostrar valores dentro de los gráficos.
  - **Leaflet.js**: Para la creación de mapas interactivos.
  - **Leaflet.AwesomeMarkers**: Para marcadores personalizados en los mapas.
  - **html2canvas**: Para la exportación de mapas a imágenes.
  - **Font Awesome**: Para la iconografía en la interfaz y los marcadores.

## ⚙️ Cómo Usar

Esta es una aplicación puramente del lado del cliente. No requiere un servidor web para funcionar.

1.  Clona o descarga este repositorio.
2.  Abre el archivo `index.html` en tu navegador web preferido (Google Chrome, Firefox, etc.).
3.  ¡Comienza a visualizar tus datos!

## 📁 Estructura del Proyecto

```
├── controllers/
│   ├── app-controller.js   # Lógica principal para la página de gráficas
│   └── map-controller.js   # Lógica principal para la página de mapas
├── models/
│   └── excel-reader.js     # Módulo para leer archivos Excel
├── views/
│   ├── chartView.js        # Módulo para renderizar gráficos
│   ├── menuView.js         # Módulo para renderizar menús
│   └── tableView.js        # Módulo para renderizar la tabla de datos
├── index.html              # Página principal (Gráficas)
├── mapa.html               # Página secundaria (Mapas)
└── README.md               # Este archivo
```