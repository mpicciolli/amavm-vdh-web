import * as React from 'react';

export interface ObservationPopupProps {
  observation: any;
}

const ObservationPopup = ({ observation }: ObservationPopupProps) => (
  <div>
    {
      observation.assets && observation.assets.length > 0 &&
        <img src={observation.assets[0].url} width={200} />
  }
  <p>{observation.comment}</p>
  </div>
);

export default ObservationPopup;