import { LatLngExpression } from 'leaflet';
import * as React from 'react';
import { Map as LeafletMap, Polyline, TileLayer } from 'react-leaflet';
import { connect } from 'react-refetch';
import { BicyclePath, BicyclePathNetwork } from 'src/entities';
import './Map.css';

const polylinePositions = (bp: BicyclePath): LatLngExpression[] => {
  return bp.geometry.coordinates[0].map((c: any) => ({
    lat: c[1],
    lng: c[0]
  }));
};

const polylineColor = (bp: BicyclePath): string => {
  switch (bp.network) {
    case BicyclePathNetwork.Seasons3:
      return "#996633";
    case BicyclePathNetwork.Seasons4:
      return "#006600";
    default:
      return "white";
  }
};

const Map = ({ seasons3BpFetch }: { seasons3BpFetch: any }) => (
  <section className="Map">
    <LeafletMap center={[45.502846, -73.568907]} zoom={13}>
      <TileLayer
        attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      { seasons3BpFetch.fulfilled &&
      seasons3BpFetch.value.items.map((x: BicyclePath) => {
        return (<Polyline key={x.id} positions={polylinePositions(x)} color={polylineColor(x)} weight={2} />);
      })}
    </LeafletMap>
  </section>
);

export default connect(() => ({
  seasons3BpFetch: {
    url: `${process.env.REACT_APP_API_URL!}/api/v1/bicycle-paths?&limit=6000`,
  },
}))(Map);
