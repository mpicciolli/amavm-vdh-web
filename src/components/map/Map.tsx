import { LatLngExpression } from 'leaflet';
import * as React from 'react';
import { Map as LeafletMap, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { Portal } from 'react-leaflet-portal';
import * as bicyclePathsData from 'src/data/bicycle-paths.json';
import './Map.css';
import MapLegend, { Colors } from './MapLegend';
import MapObservations from './MapObservations';
import ObservationPopup from './ObservationPopup';

export interface MapProps {
  center?: LatLngExpression;
  zoom?: number;
}

interface MapState {
  observations: any[];
  selectedObservationDuration: string;
}

export class Map extends React.Component<MapProps, MapState> {

  private observationsInterval;

  public constructor(props) {
    super(props);
    this.state = {
      observations: [],
      selectedObservationDuration: "2h",
    };
    this.handleSelectedObservationSelected = this.handleSelectedObservationSelected.bind(this);
  }

  public componentDidMount() {
    if (this.observationsInterval) {
      clearInterval(this.observationsInterval);
      this.observationsInterval = undefined;
    }
    this.loadObservations();
    this.observationsInterval = setInterval(
      () => this.loadObservations(),
      parseInt(process.env.REACT_APP_REFRESH_INTERVAL || "30000", 10));
  }

  public componentWillUnmount() {
    if (this.observationsInterval) {
      clearInterval(this.observationsInterval);
      this.observationsInterval = undefined;
    }
  }

  public render() {
    let { center, zoom } = this.props;
    center = center || [45.502846, -73.568907];
    zoom = zoom || 14;
    const { observations } = this.state;
    return (
      <section className="Map">
        <LeafletMap center={center} zoom={zoom}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;https://wikimediafoundation.org/wiki/Maps_Terms_of_Use&quot;>Wikimedia</a>"
            url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png"
          />
          {bicyclePathsData.map((x) => {
            return (<Polyline key={x.id} positions={this.polylinePositions(x)} color={Colors[x.network]} weight={2} />);
          })}
          {observations.map((x: any) => {
            return (
              <Marker key={x.id} position={this.markerPosition(x)}>
                <Popup onOpen={() => this.handleOpenPopup(x)} onClose={() => this.handleOpenPopup()}>
                  <ObservationPopup observation={x} />
                </Popup>
              </Marker>);
          })}
          <Portal position="topright">
            <MapLegend />
            <MapObservations selected={this.state.selectedObservationDuration} onSelected={this.handleSelectedObservationSelected} />
          </Portal>
        </LeafletMap>
      </section>);
  }

  private handleSelectedObservationSelected(value: string) {
    this.setState(
      { selectedObservationDuration: value },
      () => this.loadObservations());
  }

  private handleOpenPopup(observation?: any) {
    const searchParams = new URLSearchParams(location.search);
    if (observation) {
      searchParams.set("observationId", observation.id);
    } else {
      searchParams.delete("observationId");
    }
    history.pushState(null, '', location.pathname + '?' + searchParams.toString());
  }

  private async loadObservations() {
    const startTs = this.getObservationsStartTs();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/v1/observations?startTs=${startTs}&sort=timestamp-desc`);
    this.setState({ observations: (await response.json()).items });
  }

  private getObservationsStartTs() {
    const now = Math.round(new Date().getTime() / 1000);
    switch (this.state.selectedObservationDuration) {
      case "2h":
        return now - (2 * 60 * 60);
      case "4h":
        return now - (4 * 60 * 60);
      case "12h":
        return now - (12 * 60 * 60);
      case "1d":
        return now - (24 * 60 * 60);
      case "7d":
        return now - now; // (7 * 24 * 60 * 60);
    }

    return now;
  }

  private markerPosition(observation: any): LatLngExpression {
    return {
      lat: observation.position[1],
      lng: observation.position[0],
    };
  };

  private polylinePositions(bp: any): LatLngExpression[] {
    return bp.geometry.coordinates[0].map((c: any) => ({
      lat: c[1],
      lng: c[0]
    }));
  };
}

export default Map;
