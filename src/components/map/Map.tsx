import { LatLngExpression } from 'leaflet';
import * as React from 'react';
import { Map as LeafletMap, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { Portal } from 'react-leaflet-portal';
import * as bicyclePathsData from 'src/data/bicycle-paths.json';
import { ReportedObservation } from 'src/entities';
import './Map.css';
import MapLegend, { Colors } from './MapLegend';
import MapObservations from './MapObservations';
import ObservationPopup from './ObservationPopup';

interface MapState {
  center?: LatLngExpression;
  observations: ReportedObservation[];
  selectedObservationDuration: string;
}

export class Map extends React.Component<any, MapState> {

  private observationsInterval;
  private popupRefs: Record<string, any> = {};
  private mapRef = React.createRef() as any;

  public constructor(props) {
    super(props);
    this.state = {
      center: [45.502846, -73.568907],
      observations: [],
      selectedObservationDuration: "2h",
    };
    this.handleSelectedObservationSelected = this.handleSelectedObservationSelected.bind(this);
    this.handleOpenPopup = this.handleOpenPopup.bind(this);
    this.setPopupRef = this.setPopupRef.bind(this);
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
        <LeafletMap ref={this.mapRef} animate={true} center={this.state.center} zoom={14}>
          <TileLayer
            attribution="&amp;copy <a href=&quot;https://wikimediafoundation.org/wiki/Maps_Terms_of_Use&quot;>Wikimedia</a>"
            url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png"
          />
          {bicyclePathsData.map((x) => {
            return (<Polyline key={x.id} positions={this.polylinePositions(x.geometry.coordinates[0])} color={Colors[x.network]} weight={2} />);
          })}
          {observations.map((x) => {
            return (
              <Marker key={x.id} position={this.markerPosition(x)}>
                <Popup observation={x} ref={this.setPopupRef} onOpen={this.handleOpenPopup.bind(this, x)} onClose={this.handleOpenPopup}>
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

  private handleOpenPopup(observation?: ReportedObservation) {
    const searchParams = new URLSearchParams(location.search);
    let newUrl = location.pathname;
    if (observation) {
      searchParams.set("observationId", observation.id);
      newUrl = `${newUrl}?${searchParams.toString()}`;
      this.setState({ center: { lat: observation.position[1], lng: observation.position[0]} })
    }
    history.pushState(null, '', newUrl);
  }

  private setPopupRef(element: any) {
    if (element && element.props) {
      this.popupRefs[element.props.observation.id] = element;
    }
  }

  private async loadObservations() {
    const startTs = this.getObservationsStartTs();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/v1/observations?startTs=${startTs}&sort=timestamp-desc`);
    const observations = (await response.json()).items;
    const searchParams = new URLSearchParams(location.search);
    const selectedObservationId = searchParams.get("observationId");
    let selectedOperation: ReportedObservation | undefined;
    if (selectedObservationId) {
      if (!observations.some((x) => x.id === selectedObservationId)) {
        const selectedObsResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/v1/observations/${selectedObservationId}`);
        selectedOperation = await selectedObsResponse.json();
        observations.push(selectedOperation);
      }
    }
    this.setState({
      center: selectedOperation && { lat: selectedOperation.position[1], lng: selectedOperation.position[0]},
      observations,
    }, () => {
      if (selectedObservationId) {
        if (this.popupRefs[selectedObservationId]) {
          this.mapRef.current.leafletElement.openPopup(
            this.popupRefs[selectedObservationId].leafletElement,
            this.markerPosition(this.popupRefs[selectedObservationId].props.observation));
        }
      }
    });
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

  private markerPosition(observation: ReportedObservation): LatLngExpression {
    return {
      lat: observation.position[1],
      lng: observation.position[0],
    };
  };

  private polylinePositions(positions: number[][]): LatLngExpression[] {
    return positions.map((c) => ({
      lat: c[1],
      lng: c[0]
    }));
  };
}

export default Map;
