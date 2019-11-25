import { LatLngExpression } from 'leaflet';
import * as React from 'react';
import { Map as LeafletMap, Polyline, TileLayer } from 'react-leaflet';
import { Portal } from 'react-leaflet-portal';
import { getObservation, getObservations } from 'src/api';
import * as bicyclePathsData from 'src/data/bicycle-paths.json';
import { ReportedObservation } from 'src/entities';
import './Map.css';
import MapLegend, { Colors } from './MapLegend';
import MapObservations from './MapObservations';
import ObservationMarker from './ObservationMarker';

interface MapState {
  center?: LatLngExpression;
  observations: ReportedObservation[];
  selectedObservationDuration: string;
}

export class Map extends React.Component<any, MapState> {

  private observationsInterval;

  public constructor(props) {
    super(props);
    this.state = {
      center: [45.502846, -73.568907],
      observations: [],
      selectedObservationDuration: "2h",
    };
    this.handleSelectedObservationSelected = this.handleSelectedObservationSelected.bind(this);
    this.handleOpenPopup = this.handleOpenPopup.bind(this);
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
    const { observations } = this.state;
    return (
      <section className="Map">
        <LeafletMap animate={true} center={this.state.center} zoom={14}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;https://wikimediafoundation.org/wiki/Maps_Terms_of_Use&quot;>Wikimedia</a>"
            url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png"
          />
          {bicyclePathsData.features.map((x, index) => {
            return (<Polyline key={index} positions={this.polylinePositions(x.geometry.coordinates[0])} color={Colors[x.properties.network]} weight={2} />);
          })}
          {observations.map((x) => {
            return (<ObservationMarker key={x.id} observation={x} opened={x.id === this.getSelectedObservationId()} onPopupOpen={this.handleOpenPopup} onPopupClose={this.handleOpenPopup} />);
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

  private handleOpenPopup(arg?: {observation: ReportedObservation}) {
    this.setSelectedObservationId(arg && arg.observation && arg.observation.id);
    if (arg && arg.observation) {
      this.setState({ center: { lat: arg.observation.position[0], lng: arg.observation.position[1]} })
    }
  }

  private async loadObservations() {
    const startTs = this.getObservationsStartTs();
    const observations = (await getObservations({ startTs })).items;
    const selectedObservationId = this.getSelectedObservationId();
    let selectedOperation: ReportedObservation | undefined;
    if (selectedObservationId) {
      if (!observations.some((x) => x.id === selectedObservationId)) {
        selectedOperation = await getObservation(selectedObservationId);
        if (selectedOperation) {
          observations.push(selectedOperation);
        }
      }
    }
    this.setState({
      center: selectedOperation && { lat: selectedOperation.position[1], lng: selectedOperation.position[0]},
      observations,
    });
  }

  private getSelectedObservationId() {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get("observationId");
  }

  private setSelectedObservationId(observationId?: string) {
    const searchParams = new URLSearchParams(location.search);
    let newUrl = location.pathname;
    if (observationId) {
      searchParams.set("observationId", observationId);
      newUrl = `${newUrl}?${searchParams.toString()}`;
    }
    history.pushState(null, '', newUrl);
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
        return now - (7 * 24 * 60 * 60);
    }

    return now;
  }

  private polylinePositions(positions: number[][]): LatLngExpression[] {
    return positions.map((c) => ({
      lat: c[1],
      lng: c[0]
    }));
  };
}

export default Map;
