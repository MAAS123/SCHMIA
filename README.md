# GeoSketch

Aplicativo web simples para **desenhos georreferenciados** com mapa interativo.

## Link do aplicativo (navegador)

Após iniciar um servidor local nesta pasta, abra:

- **http://localhost:8000/index.html**

### Início rápido

```bash
python3 -m http.server 8000
```

Depois, acesse o link acima no navegador.

## Funcionalidades

- Desenho de ponto, linha, polígono, retângulo e círculo.
- Edição e remoção das feições no mapa.
- Cálculo resumido de área e extensão.
- Exportação dos dados em GeoJSON.
- Importação de GeoJSON.
- Salvamento automático local (localStorage).
- Atalho para centralizar na localização atual.

## Como usar

1. Abra `index.html` no navegador (ou use o link local com `http.server`).
2. Use a barra de desenho do mapa para criar as feições.
3. Exporte quando quiser salvar em arquivo `.geojson`.
4. Importe um arquivo `.geojson` para continuar um trabalho.

## Tecnologias

- [Leaflet](https://leafletjs.com/)
- [Leaflet.Draw](https://github.com/Leaflet/Leaflet.draw)
- OpenStreetMap Tiles
