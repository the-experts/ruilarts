import React, {useEffect, useRef} from "react";
import maplibregl, {Map as MapLibreMap} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const data = [
    { id: 1, name: "New York", latitude: 40.7128, longitude: -74.006 },
    { id: 2, name: "London", latitude: 51.5074, longitude: -0.1278 },
    { id: 3, name: "Tokyo", latitude: 35.6895, longitude: 139.6917 },
  ]

  // Initialize map only once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        "version": 8,
        "sources": {
          "osm": {
            "type": "raster",
            "tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            "tileSize": 256,
            "attribution": "&copy; OpenStreetMap Contributors",
            "maxzoom": 22
          }
        },
        "layers": [
          {
            "id": "osm",
            "type": "raster",
            "source": "osm" // This must match the source key above
          }
        ]
      },
      center: [5.311177, 52.189589],
      zoom: 8,
    });

    mapRef.current = map;

    return () => map.remove(); // cleanup on unmount
  }, []);

  // Add markers when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !data) return;

    data.forEach((loc) => {
      new maplibregl.Marker()
        .setLngLat([loc.longitude, loc.latitude])
        .setPopup(new maplibregl.Popup().setText(loc.name))
        .addTo(map);
    });
  }, [data]);

  // if (isLoading) return <p>Loading map data...</p>;
  // if (error) return <p>Error: {(error as Error).message}</p>;

  return (
    <div
      ref={mapContainerRef}
      style={{ width: "100rem", height: "100rem", borderRadius: "8px" }}
    />
  );
};

export default MapView;
