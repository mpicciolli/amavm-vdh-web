import { LatLngExpression } from 'leaflet';
import * as React from 'react';
import { Map as LeafletMap, Polyline, TileLayer } from 'react-leaflet';
import { Portal } from 'react-leaflet-portal';
import { connect } from 'react-refetch';
import * as bicyclePathsData from 'src/data/bicycle-paths.json';
import { BicyclePath } from 'src/entities';
import './Map.css';
import MapLegend, { Colors } from './MapLegend';

const polylinePositions = (bp: BicyclePath): LatLngExpression[] => {
  return bp.geometry.coordinates[0].map((c: any) => ({
    lat: c[1],
    lng: c[0]
  }));
};

const Map = ({ bicyclePaths }: { bicyclePaths: BicyclePath[] }) => (
  <section className="Map">
    <LeafletMap center={[45.502846, -73.568907]} zoom={13}>
      <TileLayer
        attribution="&amp;copy <a href=&quot;https://wikimediafoundation.org/wiki/Maps_Terms_of_Use&quot;>Wikimedia</a>"
        url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png"
      />
      {bicyclePaths.map((x: BicyclePath) => {
        return (<Polyline key={x.id} positions={polylinePositions(x)} color={Colors[x.network]} weight={2} />);
      })}
      <Portal position="topright">
        <MapLegend />
      </Portal>
    </LeafletMap>
  </section>
);

const MapWithBicyclePaths = (WrappedComponent) =>
  (props) => (<WrappedComponent bicyclePaths={bicyclePathsData} {...props} />);

export default connect(() => ({
}))(MapWithBicyclePaths(Map));
