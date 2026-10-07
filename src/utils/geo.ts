/**
 * Geodesic and cartographic helper utilities
 */

export function generateCurvedRoute(
  start: [number, number], // [lon, lat]
  end: [number, number],   // [lon, lat]
  numPoints: number = 30,
  arcHeightFactor: number = 0.15
): [number, number][] {
  const points: [number, number][] = [];
  const [lon1, lat1] = start;
  const [lon2, lat2] = end;

  const dLon = lon2 - lon1;
  const dLat = lat2 - lat1;
  const dist = Math.sqrt(dLon * dLon + dLat * dLat);

  // Perpendicular vector for curving
  const normalX = -dLat / (dist || 1);
  const normalY = dLon / (dist || 1);

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Linear interpolation
    let lon = lon1 + dLon * t;
    let lat = lat1 + dLat * t;

    // Parabolic arc displacement
    const arc = Math.sin(t * Math.PI) * dist * arcHeightFactor;
    lon += normalX * arc;
    lat += normalY * arc;

    points.push([
      Math.round(lon * 1000) / 1000,
      Math.round(lat * 1000) / 1000
    ]);
  }

  return points;
}

export function formatCoordinates(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(1)}°${latDir}, ${Math.abs(lon).toFixed(1)}°${lonDir}`;
}
