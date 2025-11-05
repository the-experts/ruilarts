import {useEffect, useRef} from "react";
import maplibregl, {Map as MapLibreMap} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {Huisarts} from "@/data/huisartsService.ts";

interface MapViewProps {
    matches?: Huisarts[]
}

const MapView = ({matches}: MapViewProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);

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
        if (!map || !matches) return;

        matches.forEach((loc) => {
            new maplibregl.Marker()
                .setLngLat([loc.longitude, loc.latitude])
                .setPopup(new maplibregl.Popup().setText(loc.naam))
                .addTo(map);
        });
    }, [matches]);

    // if (isLoading) return <p>Loading map data...</p>;
    // if (error) return <p>Error: {(error as Error).message}</p>;

    return (
        <div
            ref={mapContainerRef}
            style={{width: "100rem", height: "100rem", borderRadius: "8px"}}
        />
    );
};

export default MapView;
