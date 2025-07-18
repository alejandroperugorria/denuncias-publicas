const map = L.map('map').setView([-34.6037, -58.3816], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let currentLatLng = null;
const denuncias = [];
const marcadores = [];

const colores = {
  "Robo": "red",
  "Accidente": "orange",
  "Disturbios": "purple",
  "Venta de droga": "green"
};

map.on('click', function(e) {
  currentLatLng = e.latlng;
});

function guardarDenuncia() {
  if (!currentLatLng) return alert("Hacé clic en el mapa primero.");
  const tipo = document.getElementById('tipo').value;
  const resumen = document.getElementById('resumen').value;
  const fecha = new Date().toLocaleString();
  const lat = currentLatLng.lat.toFixed(6);
  const lng = currentLatLng.lng.toFixed(6);

  const icon = L.icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${colores[tipo]}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png"
  });

  const marker = L.marker([lat, lng], { icon }).addTo(map)
    .bindPopup(`<strong>${tipo}</strong><br>${resumen}<br>${fecha}`);
  marker._id = denuncias.length;

  denuncias.push({ tipo, resumen, fecha, lat, lng });
  marcadores.push(marker);
  agregarFila(denuncias.length - 1);
  currentLatLng = null;
  document.getElementById('resumen').value = '';
}

function agregarFila(index) {
  const tabla = document.querySelector("#tabla tbody");
  const d = denuncias[index];

  const fila = document.createElement("tr");
  fila.innerHTML = `
    <td class="select-col"><input type="checkbox" class="fila-checkbox" data-id="${index}"></td>
    <td>${d.tipo}</td>
    <td>${d.resumen}</td>
    <td>${d.fecha}</td>
    <td>${d.lat}</td>
    <td>${d.lng}</td>
    <td><button onclick="centrar(${index})">Ir</button></td>
    <td><button onclick="eliminar(${index})">X</button></td>
  `;
  tabla.appendChild(fila);
}

function centrar(index) {
  const d = denuncias[index];
  map.setView([d.lat, d.lng], 16);
  marcadores[index].openPopup();
}

function eliminar(index) {
  if (confirm("¿Eliminar esta denuncia?")) {
    map.removeLayer(marcadores[index]);
    denuncias[index] = null;
    marcadores[index] = null;
    actualizarTabla();
  }
}

function actualizarTabla() {
  const tbody = document.querySelector("#tabla tbody");
  tbody.innerHTML = "";
  denuncias.forEach((d, i) => {
    if (d) agregarFila(i);
  });
}

function seleccionarTodos(origen) {
  const checkboxes = document.querySelectorAll('.fila-checkbox');
  const marcar = origen?.checked ?? true;
  checkboxes.forEach(c => c.checked = marcar);
}

function descargarCSV() {
  const datosValidos = denuncias.filter(d => d !== null);
  let csv = "Tipo,Resumen,Fecha,Latitud,Longitud\n";
  datosValidos.forEach(d => {
    csv += `"${d.tipo}","${d.resumen}","${d.fecha}",${d.lat},${d.lng}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "denuncias.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function cerrarModal() {
  document.getElementById('modal').style.display = 'none';
}
