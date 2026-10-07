export const MAP_CONFIG = {
  center: [78.9629, 22.5937] as [number, number], // Centered on India
  zoom: 4.3,
  minZoom: 3.2,
  maxZoom: 7.5,
  maxBounds: [
    [50.0, 3.0],   // Southwest coordinates (encompassing Indian Ocean & Horn of Africa)
    [105.0, 39.0], // Northeast coordinates (encompassing Central Asia & Southeast Asia)
  ] as [[number, number], [number, number]],
};

// Neighbouring country reference points (natural sentence case)
export const NEIGHBOURING_REGIONS = [
  { id: 'pakistan', name: 'Pakistan', coordinates: [69.3451, 30.3753] },
  { id: 'china', name: 'China / Tibet', coordinates: [88.5, 33.5] },
  { id: 'nepal', name: 'Nepal', coordinates: [84.124, 28.3949] },
  { id: 'bhutan', name: 'Bhutan', coordinates: [90.4336, 27.5142] },
  { id: 'bangladesh', name: 'Bangladesh', coordinates: [90.3563, 23.685] },
  { id: 'myanmar', name: 'Myanmar', coordinates: [95.956, 21.9162] },
  { id: 'sri-lanka', name: 'Sri Lanka', coordinates: [80.7718, 7.8731] },
];

// Historical sea labels (natural sentence case)
export const HISTORICAL_SEAS = [
  { id: 'arabian-sea', name: 'Arabian Sea', subtitle: 'Sindhu Sagar', coordinates: [67.0, 16.0] },
  { id: 'bay-of-bengal', name: 'Bay of Bengal', subtitle: 'Purva Samudra', coordinates: [89.0, 14.5] },
  { id: 'indian-ocean', name: 'Indian Ocean', subtitle: 'Ratnakara', coordinates: [78.5, 5.0] },
];

/**
 * Filter and tint base map layers to neutral grayscale
 */
export function customizeBaseMapStyle(map: any) {
  try {
    const style = map.getStyle();
    if (!style || !style.layers) return;

    const layersToHide = [
      'road', 'highway', 'street', 'tunnel', 'bridge', 'transit',
      'rail', 'poi', 'airport', 'aeroway', 'building', 'ferry'
    ];

    style.layers.forEach((layer: any) => {
      const id = layer.id.toLowerCase();

      // Hide roads and modern infrastructure
      if (layersToHide.some(pattern => id.includes(pattern))) {
        if (map.getLayer(layer.id)) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      }

      // Neutral grayscale sea
      if (id.includes('water') || id.includes('ocean')) {
        if (map.getLayer(layer.id)) {
          try {
            map.setPaintProperty(layer.id, 'fill-color', '#f0f0f0');
            map.setPaintProperty(layer.id, 'fill-opacity', 0.9);
          } catch {}
        }
      }

      // Neutral background
      if (id.includes('background')) {
        if (map.getLayer(layer.id)) {
          try {
            map.setPaintProperty(layer.id, 'background-color', '#f5f5f5');
          } catch {}
        }
      }

      // Neutral boundary lines
      if (id.includes('boundary') || id.includes('admin')) {
        if (map.getLayer(layer.id)) {
          try {
            map.setPaintProperty(layer.id, 'line-color', '#dddddd');
            map.setPaintProperty(layer.id, 'line-opacity', 0.5);
            map.setPaintProperty(layer.id, 'line-width', 0.8);
          } catch {}
        }
      }
    });
  } catch (err) {
    console.warn('Error adjusting base map layers:', err);
  }
}
