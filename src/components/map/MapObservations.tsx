import * as React from 'react';
import './MapObservations.css';

export interface MapObservationsProps {
  selected: string;
  onSelected?: (selected: string) => void;
}

interface ObservationButton {
  title: string;
  value: string;
}

const buttons: ObservationButton[] = [
  { title: "2 heures", value: "2h" },
  { title: "4 heures", value: "4h" },
  { title: "12 heures", value: "12h" },
  { title: "1 journée", value: "1d" },
  { title: "1 semaine", value: "7d" },
];

const handleOnSelected = (props: MapObservationsProps, value: string) =>
  (event: React.SyntheticEvent<HTMLButtonElement>) => {
    if (props.onSelected) {
      props.onSelected(value);
    }
  };

const MapObservations = (props: MapObservationsProps) => (
  <div className='MapObservations'>
    <h2>Observations</h2>
    {buttons.map((button) => {
      return (<button
        className={"ObservationButton " + (props.selected === button.value ? "Selected " : "")}
        key={button.value}
        onClick={handleOnSelected(props, button.value)}>{button.title}</button>);
    })}
  </div>
);

export default MapObservations;