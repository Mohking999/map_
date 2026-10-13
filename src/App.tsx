import { useEffect, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import SearchBox, { type SelectedLocation } from './SearchBox'

const INITIAL_POSITION: [number, number] = [51.505, -0.09]

function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, 13)
  }, [map, position])

  return null
}

function Map() {
  const [position, setPosition] = useState<[number, number]>(INITIAL_POSITION)
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null)

  const selectLocation = (location: SelectedLocation) => {
    setPosition([Number(location.lat), Number(location.lon)])
    setSelectedLocation(location)
  }

  return (
    <main className="map-page">
      <SearchBox onLocationSelect={selectLocation} />

      <MapContainer
        center={INITIAL_POSITION}
        zoom={13}
        className="leaflet-map"
      >
        <RecenterMap position={position} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            {selectedLocation?.name ?? 'Search for a place to move the map here.'}
          </Popup>
        </Marker>
      </MapContainer>
    </main>
  )
}

export default Map