import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { PetrolStation } from './stationInfo';

// Define the map container style
const containerStyle = {
  height: '100%',
  width: '100%',
};


// Default center coordinates
const defaultCenter = { lat: -35.282159, lng: 149.125779 };

interface GoogleMapComponentProps {
  petrolStations: PetrolStation[];
  bestStationCoords: { lat: number; lng: number } | null; // Adjust if centerCoords can be null
  startCoords: { lat: number; lng: number } | null;
  endCoords: { lat: number; lng: number } | null;
}


const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ petrolStations, bestStationCoords, startCoords, endCoords }) => {
  const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      })

      const [map, setMap] = useState(null)
      const [selectedStation, setSelectedStation] = useState<PetrolStation | null>(null);
      const [infoOpen, setInfoOpen] = useState(false); // Ensure this line is included
      const [polyline, setPolyline] = useState<Polyline | null>(null);
  

      const onLoad = React.useCallback(function callback(map) {
        console.log('loading map')
        const bounds = new window.google.maps.LatLngBounds();
        petrolStations.forEach((point) => bounds.extend(point.location));
        map.fitBounds(bounds);
        setMap(map)
      }, [startCoords, bestStationCoords, endCoords])
    
      const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
      }, [])

      useEffect(() => {
        const fetchDirections = async () => {
          polyline && polyline.setMap(null);
          if (startCoords && endCoords && bestStationCoords) {
            const directionsService = new window.google.maps.DirectionsService();
            const result = await directionsService.route({
              origin: startCoords,
              destination: endCoords,
              waypoints: [{ location: bestStationCoords }],
              travelMode: window.google.maps.TravelMode.DRIVING,
            });
    
            const path = result.routes[0].overview_path.map((point) => ({
              lat: point.lat(),
              lng: point.lng(),
            }));
          
        const bounds = new window.google.maps.LatLngBounds();
        path.forEach((point) => bounds.extend(point));
        
        // Center and fit the map to the bounds
        map.fitBounds(bounds);

            // Draw the polyline
            const polyline = new window.google.maps.Polyline({
              path: path,
              geodesic: true,
              strokeColor: '#FF0000', // Color of the polyline
              strokeOpacity: 1.0,
              strokeWeight: 2, // Thickness of the polyline
            });

            setPolyline(polyline);
    
            // Set the polyline on the map
            polyline.setMap(map);
          }
        };
        fetchDirections();
    }, [startCoords, endCoords, bestStationCoords]);
  

      return isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={bestStationCoords ?? defaultCenter}
          zoom={5}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          { /* Child components, such as markers, info windows, etc. */ }
            {petrolStations.map(station => (
                <Marker
                   key={station.id}
                  position={station.location}
                   title={station.name}
                   onClick={() => {
                     setSelectedStation(station);
                     setInfoOpen(true); // Open InfoWindow on marker click
                   }} 
                />
              ))}
              {selectedStation && infoOpen && (
                <InfoWindow
                  position={selectedStation.location}
                  onCloseClick={() => {
                    setInfoOpen(false); // Close InfoWindow
                    setSelectedStation(null); // Optionally clear selected station
                  }} 
                >
                  <div>
                    <h2 className="font-bold">{selectedStation.name}</h2>
                    <p>Price per Litre: ${selectedStation.price_per_litre.toFixed(2)}</p>
                  </div>
                </InfoWindow>)} 
        </GoogleMap>
    ) : <></>
};

export default GoogleMapComponent;
