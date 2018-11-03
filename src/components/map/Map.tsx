import { LatLngExpression } from 'leaflet';
import * as React from 'react';
import { Map as LeafletMap, Marker, Polyline, TileLayer } from 'react-leaflet';
import { Portal } from 'react-leaflet-portal';
import { connect } from 'react-refetch';
import * as bicyclePathsData from 'src/data/bicycle-paths.json';
import { BicyclePath } from 'src/entities';
import './Map.css';
import MapLegend, { Colors } from './MapLegend';
import MapObservations from './MapObservations';

const polylinePositions = (bp: BicyclePath): LatLngExpression[] => {
  return bp.geometry.coordinates[0].map((c: any) => ({
    lat: c[1],
    lng: c[0]
  }));
};

const markerPosition = (observation: any): LatLngExpression => {
  return {
    lat: observation.position[1],
    lng: observation.position[0],
  };
};

export interface MapProps {
  bicyclePaths: BicyclePath[];
  observationsFetch: any;
  onObservationSelected?: (value: string) => void;
  selectedObservationDuration: string;
}

const Map = ({ bicyclePaths, observationsFetch, onObservationSelected, selectedObservationDuration }: MapProps) => (
  <section className="Map">
    <LeafletMap center={[45.502846, -73.568907]} zoom={13}>
      <TileLayer
        attribution="&amp;copy <a href=&quot;https://wikimediafoundation.org/wiki/Maps_Terms_of_Use&quot;>Wikimedia</a>"
        url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png"
      />
      {bicyclePaths.map((x: BicyclePath) => {
        return (<Polyline key={x.id} positions={polylinePositions(x)} color={Colors[x.network]} weight={2} />);
      })}
      {observationsFetch.fulfilled && observationsFetch.value.items.map((x: any) => {
        return (<Marker key={x.id}  position={markerPosition(x)} />);
      })}
      <Portal position="topright">
        <MapLegend />
        <MapObservations selected={selectedObservationDuration} onSelected={onObservationSelected} />
      </Portal>
    </LeafletMap>
  </section>
);

const MapWithBicyclePaths = (WrappedComponent) =>
  (props) => (<WrappedComponent bicyclePaths={bicyclePathsData} {...props} />);

const MapWithSelectedObservations = (WrappedComponent) => {
  return class extends React.Component<any, any> {
    public constructor(props) {
      super(props);
      this.handleObservationSelected = this.handleObservationSelected.bind(this);
      this.state = {
        selectedObservationDuration: "2h",
      };
    }

    public render() {
      // tslint:disable-next-line:jsx-no-lambda
      return (<WrappedComponent onObservationSelected={this.handleObservationSelected} selectedObservationDuration={this.state.selectedObservationDuration} {...this.props} />);
    }

    private handleObservationSelected(value: string) {
      this.setState({ selectedObservationDuration: value });
    }
  };
};

export default MapWithBicyclePaths(
  MapWithSelectedObservations(
    connect((props) => ({
      observationsFetch: {
        refreshInterval: parseInt(process.env.REACT_APP_REFRESH_INTERVAL || "30000", 10),
        url: `${process.env.REACT_APP_API_URL}/api/v1/observations`,
      },
    }))(Map)));
