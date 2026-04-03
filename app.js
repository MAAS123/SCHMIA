const STORAGE_KEY = 'geosketch_features_v1';

const map = L.map('map').setView([-15.77972, -47.92972], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);

const drawControl = new L.Control.Draw({
  draw: {
    polyline: true,
    polygon: true,
    rectangle: true,
    circle: true,
    marker: true,
    circlemarker: false
  },
  edit: {
    featureGroup: editableLayers
  }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, ({ layer }) => {
  editableLayers.addLayer(layer);
  persist();
  refreshSummary();
});

map.on(L.Draw.Event.EDITED, () => {
  persist();
  refreshSummary();
});

map.on(L.Draw.Event.DELETED, () => {
  persist();
  refreshSummary();
});

function formatDistance(meters) {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${meters.toFixed(0)} m`;
}

function formatArea(squareMeters) {
  if (squareMeters >= 1000000) return `${(squareMeters / 1000000).toFixed(2)} km²`;
  return `${squareMeters.toFixed(0)} m²`;
}

function toGeoJSON() {
  return editableLayers.toGeoJSON();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toGeoJSON()));
}

function refreshSummary() {
  let markers = 0;
  let lines = 0;
  let polygons = 0;
  let totalArea = 0;
  let totalLength = 0;

  editableLayers.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      markers += 1;
      return;
    }

    if (layer instanceof L.Circle) {
      polygons += 1;
      totalArea += Math.PI * Math.pow(layer.getRadius(), 2);
      return;
    }

    if (layer instanceof L.Polygon) {
      polygons += 1;
      const latLngs = layer.getLatLngs();
      const firstRing = Array.isArray(latLngs[0]) ? latLngs[0] : latLngs;
      totalArea += Math.abs(L.GeometryUtil.geodesicArea(firstRing));
      return;
    }

    if (layer instanceof L.Polyline) {
      lines += 1;
      const points = layer.getLatLngs();
      for (let i = 0; i < points.length - 1; i += 1) {
        totalLength += points[i].distanceTo(points[i + 1]);
      }
    }
  });

  document.getElementById('count-markers').textContent = markers;
  document.getElementById('count-lines').textContent = lines;
  document.getElementById('count-polygons').textContent = polygons;
  document.getElementById('total-area').textContent = formatArea(totalArea);
  document.getElementById('total-length').textContent = formatDistance(totalLength);
}

function loadSavedFeatures() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const imported = L.geoJSON(parsed);
    imported.eachLayer((layer) => editableLayers.addLayer(layer));
  } catch (error) {
    console.warn('Falha ao carregar dados locais:', error);
    localStorage.removeItem(STORAGE_KEY);
  }
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

document.getElementById('btn-export').addEventListener('click', () => {
  const content = JSON.stringify(toGeoJSON(), null, 2);
  downloadFile('desenhos-georreferenciados.geojson', content, 'application/geo+json');
});

document.getElementById('input-import').addEventListener('change', async (event) => {
  const [file] = event.target.files;
  if (!file) return;

  const content = await file.text();
  try {
    const parsed = JSON.parse(content);
    editableLayers.clearLayers();
    const imported = L.geoJSON(parsed);
    imported.eachLayer((layer) => editableLayers.addLayer(layer));
    persist();
    refreshSummary();
  } catch {
    alert('Arquivo inválido. Selecione um GeoJSON válido.');
  }

  event.target.value = '';
});

document.getElementById('btn-clear').addEventListener('click', () => {
  if (!confirm('Deseja remover todos os desenhos?')) return;
  editableLayers.clearLayers();
  persist();
  refreshSummary();
});

document.getElementById('btn-location').addEventListener('click', () => {
  if (!navigator.geolocation) {
    alert('Geolocalização não suportada neste navegador.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      map.setView([coords.latitude, coords.longitude], 16);
      L.marker([coords.latitude, coords.longitude], {
        title: 'Minha localização'
      }).addTo(map);
    },
    () => alert('Não foi possível obter sua localização.')
  );
});

loadSavedFeatures();
refreshSummary();
