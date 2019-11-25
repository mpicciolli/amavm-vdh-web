import { LatLngExpression } from 'leaflet';
import * as React from "react";
import { ILeafletContext, Marker, Popup, withLeaflet } from "react-leaflet";
import { ReportedObservation } from 'src/entities';
import ObservationPopup from './ObservationPopup';

export interface ObservationMarkerProps {
  observation: ReportedObservation;
  opened?: boolean;
  onPopupOpen?: (args: { observation: ReportedObservation }) => void;
  onPopupClose?: () => void;
}

class ObservationMarker extends React.Component<ILeafletContext & ObservationMarkerProps> {

  private readonly popupRef = React.createRef<any>();

  public constructor(props: ILeafletContext & ObservationMarkerProps) {
    super(props);
    this.handleOnOpen = this.handleOnOpen.bind(this);
    this.handleOnClose = this.handleOnClose.bind(this);
  }

  public render() {
    const { leaflet, observation, opened } = this.props;
    if (opened) {
      setTimeout(() => {
        leaflet.map.openPopup(
          this.popupRef.current.leafletElement,
          this.markerPosition(observation));
      }, 0);
    }
    return (
      <Marker key={observation.id} position={this.markerPosition(observation)}>
        <Popup ref={this.popupRef} onOpen={this.handleOnOpen} onClose={this.handleOnClose}>
          <ObservationPopup observation={observation} />
        </Popup>
      </Marker>
    );
  }

  private markerPosition(observation: ReportedObservation): LatLngExpression {
    return {
      lat: observation.position[0],
      lng: observation.position[1],
    };
  };

  private handleOnOpen() {
    if (this.props.onPopupOpen) {
      this.props.onPopupOpen({ observation: this.props.observation });
    }
  }

  private handleOnClose() {
    if (this.props.onPopupClose) {
      this.props.onPopupClose();
    }
  }

}

export default withLeaflet(ObservationMarker);
