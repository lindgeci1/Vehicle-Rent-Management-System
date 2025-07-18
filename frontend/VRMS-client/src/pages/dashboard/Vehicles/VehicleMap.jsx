import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Tooltip as LeafletTooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { api } from "@/apiClient";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function Recenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
}

export function VehicleMap({ vehicleId }) {
  const [gpsData, setGpsData] = useState([]);

  useEffect(() => {
    const fetchGpsData = async () => {
      try {
        const res = await api.get(`/gps/history/active`);
        setGpsData(res.data || []);
      } catch (err) {
        console.error("Failed to fetch GPS data:", err);
      }
    };

    fetchGpsData();
    const interval = setInterval(fetchGpsData, 15000);
    return () => clearInterval(interval);
  }, [vehicleId]);

  const lastPosition =
    gpsData.length > 0
      ? [gpsData[gpsData.length - 1].latitude, gpsData[gpsData.length - 1].longitude]
      : [42.6486, 21.1623];

  const vehicleTracks = gpsData.reduce((acc, point) => {
    const key = point.vehicleId;
    if (!acc[key]) acc[key] = [];
    acc[key].push(point);
    return acc;
  }, {});

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-md p-4 mb-4">
        <h2 className="text-2xl font-semibold text-blue-gray-800">
          Live GPS Tracking
        </h2>
        <p className="text-sm text-blue-gray-500">
          Real-time vehicle locations and movement paths
        </p>
      </div>

      <div className="rounded-xl overflow-hidden shadow-lg border border-blue-gray-100">
        <MapContainer
          // center={lastPosition}
          // zoom={13}
          // className="h-[80vh] w-full"

            center={lastPosition}
  zoom={13}
  style={{
    height: '50vh',            // only half the viewport height
    width: '100%',
    position: 'relative',      
    zIndex: 0                  // ensure it stays “under” any modal/dialog
  }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {Object.entries(vehicleTracks).map(([vehicleId, points]) => {
            const path = points.map(p => [p.latitude, p.longitude]);
            const lastPoint = points[points.length - 1];

            return (
              <React.Fragment key={vehicleId}>
                {path.length > 1 && (
                  <Polyline
                    positions={path}
                    color={`hsl(${(parseInt(vehicleId, 10) * 47) % 360}, 70%, 50%)`}
                  />
                )}
                {lastPoint && (
                  <Marker position={[lastPoint.latitude, lastPoint.longitude]}>
                    <LeafletTooltip direction="top" offset={[0, -10]} opacity={0.9}>
                      <span>{`Vehicle: ${lastPoint.mark} ${lastPoint.model}`}</span>
                    </LeafletTooltip>
                  </Marker>
                )}
              </React.Fragment>
            );
          })}

          <Recenter position={lastPosition} />
        </MapContainer>
      </div>
    </div>
  );
}

export default VehicleMap;
