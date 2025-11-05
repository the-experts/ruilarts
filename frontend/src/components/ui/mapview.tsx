import {useEffect, useRef} from "react";
import maplibregl, {Map as MapLibreMap} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {Huisarts} from "@/data/huisartsService.ts";

interface MapViewProps {
    doctors?: Huisarts[]
}

const MapView = ({doctors}: MapViewProps) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    let index = 0;
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
                        "maxzoom": 21
                    }
                },
                "layers": [
                    {
                        "id": "osm",
                        "type": "raster",
                        "source": "osm" // This must match the source key above
                    }
                ],

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
        if (!map || !doctors) return;

        doctors.forEach((doctor) => {
            new maplibregl.Marker()
                .setLngLat([doctor.longitude, doctor.latitude])
                .setPopup(new maplibregl.Popup().setText(doctor.naam))
                .addTo(map);
        });
        map.setCenter({
            lon: doctors[0].longitude,
            lat: doctors[0].latitude
        })

    }, [doctors]);

    // if (isLoading) return <p>Loading map data...</p>;
    // if (error) return <p>Error: {(error as Error).message}</p>;

    return (
        <div>
            <div
                ref={mapContainerRef}
                style={{width: "90rem", height: "50rem", borderRadius: "8px"}}
            />
            <button onClick={() => {
                // console.log('clicked')

                const map = mapRef.current;
                if (doctors) {
                    if (index + 1 >= doctors.length) {
                        index--;
                    } else {
                        index++;
                    }
                    map?.setCenter({
                        lon: doctors[index].longitude,
                        lat: doctors[index].latitude,
                    })
                }
            }}> To next doctor
            </button>
        </div>
    );
};

export default MapView;
