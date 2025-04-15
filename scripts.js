// Inicializar el mapa
const map = L.map('map').setView([-29.95, -71.34], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Función para crear contenido del popup
function createPopupContent(feature) {
  return `
    <table>
      <tr><th>Sector</th><td>${feature.properties.Sector || 'No disponible'}</td></tr>
      <tr><th>Habitantes</th><td>${feature.properties.Habitantes || '0'}</td></tr>
      <tr><th>Hombres</th><td>${feature.properties.Hombres || '0'}</td></tr>
      <tr><th>Mujeres</th><td>${feature.properties.Mujeres || '0'}</td></tr>
    </table>
  `;
}

// Estilos de los sectores
const sectorStyles = {
  'Tierras Blancas': { color: '#cc6666', fillColor: '#f4cccc', fillOpacity: 0.7 },
  'Bosque San Carlos': { color: '#93c47d', fillColor: '#d9ead3', fillOpacity: 0.7 },
  // Agrega más estilos aquí...
};

// Capa GeoJSON
const geojsonLayer = L.geoJSON(json_Sectores2jsonSectores2_1, {
  style: feature => sectorStyles[feature.properties.Sector] || { color: 'black', weight: 1, fillColor: '#FFFFFF', fillOpacity: 0.5 },
  onEachFeature: function(feature, layer) {
    layer.bindPopup(createPopupContent(feature));
    layer.on('click', function () {
      const sectorName = feature.properties.Sector;
      const sectorIndex = sectorLabels.indexOf(sectorName);

      // Actualizar colores del gráfico de barras
      barChart.data.datasets[0].backgroundColor = sectorLabels.map((_, index) =>
        index === sectorIndex ? '#FF5722' : '#E0E0E0'
      );

      // Actualizar datos del gráfico de pastel
      pieChart.data.datasets[0].data = [
        parseInt(feature.properties.Hombres) || 0,
        parseInt(feature.properties.Mujeres) || 0
      ];
      pieChart.options.plugins.title.text = `Distribución por género - ${sectorName}`;
      
      // Actualizar gráficos
      pieChart.update();
      barChart.update();
    });
  }
}).addTo(map);

// Ajustar límites del mapa a los datos
map.fitBounds(geojsonLayer.getBounds());

// Datos para los gráficos
const sectorLabels = json_Sectores2jsonSectores2_1.features.map(f => f.properties.Sector || 'Desconocido');
const poblacionData = json_Sectores2jsonSectores2_1.features.map(f => parseInt(f.properties.Habitantes) || 0);

// Configuración del gráfico de barras
const ctxBar = document.getElementById('barChart').getContext('2d');
const barChart = new Chart(ctxBar, {
  type: 'bar',
  data: {
    labels: sectorLabels,
    datasets: [{
      label: 'Habitantes por sector',
      data: poblacionData,
      backgroundColor: sectorLabels.map(() => '#FF9800'),
      borderColor: '#FF5722',
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Cantidad de habitantes' } },
      x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: context => `${context.parsed.y.toLocaleString()} personas`
        }
      }
    }
  }
});

// Configuración del gráfico de pastel
const ctxPie = document.getElementById('pieChart').getContext('2d');
const pieChart = new Chart(ctxPie, {
  type: 'pie',
  data: {
    labels: ['Hombres', 'Mujeres'],
    datasets: [{
      data: [0, 0],
      backgroundColor: ['#2196F3', '#FF4081'],
      hoverBackgroundColor: ['#64B5F6', '#FF80AB']
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: { display: true, text: 'Distribución por género (haz clic en un sector)' },
      legend: { display: true, position: 'bottom' },
      tooltip: { enabled: true },
      datalabels: {
        color: '#000',
        font: { weight: 'bold', size: 14 },
        formatter: value => value.toLocaleString()
      }
    }
  },
  plugins: [ChartDataLabels]
});

// Configuración para arrastrar el gráfico de pastel
interact('#draggable').draggable({
  inertia: true,
  modifiers: [
    interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true })
  ],
  autoScroll: true,
  onmove(event) {
    const x = (parseFloat(event.target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(event.target.getAttribute('data-y')) || 0) + event.dy;
    event.target.style.transform = `translate(${x}px, ${y}px)`;
    event.target.setAttribute('data-x', x);
    event.target.setAttribute('data-y', y);
  }
});

// Evento para cerrar el texto informativo (garantizando que no se cierre automáticamente)
const textoDiv = document.getElementById("texto");
const cerrarTextoButton = document.getElementById("cerrarTexto");

// Aseguramos que el div "texto" esté visible al inicio
textoDiv.style.display = "block"; 
textoDiv.style.visibility = "visible";

// Añadimos el evento para cerrar únicamente al hacer clic en el botón
cerrarTextoButton.addEventListener("click", function () {
  textoDiv.style.animation = "fadeOutUp 0.8s ease forwards";
  setTimeout(() => {
    textoDiv.style.display = "none";
  }, 800); // Espera al final de la animación antes de ocultarlo
});
