import { formatRelative } from 'date-fns'
import { fr } from 'date-fns/locale'
import * as React from 'react';
import { ReportedObservation } from 'src/entities';

export interface ObservationPopupProps {
  observation: ReportedObservation;
}

const dateDisplay = (observation: ReportedObservation) => {
  return formatRelative(
    new Date(observation.timestamp * 1000),
    new Date(),
    { locale: fr });
};

const ObservationPopup = ({ observation }: ObservationPopupProps) => (
  <div>
    {
      observation.assets && observation.assets.length > 0 &&
        <a href={observation.assets[0].url} target="_blank">
          <img src={observation.assets[0].url} width={200} />
        </a>
  }
  <p className="timestamp">{dateDisplay(observation)}</p>
  <p>{observation.comment}</p>
  </div>
);

export default ObservationPopup;