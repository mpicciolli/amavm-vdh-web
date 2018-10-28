import * as React from 'react';
import { BicyclePathNetwork } from 'src/entities';
import './MapLegend.css';

export const Colors = {
  [BicyclePathNetwork.Seasons3]: "#6bb26b",
  [BicyclePathNetwork.Seasons4]: "#76b2d0",
  [BicyclePathNetwork.Unknown]: "white",
};

const Season4Style = {
  backgroundColor: Colors[BicyclePathNetwork.Seasons4],
};

const Season3Style = {
  backgroundColor: Colors[BicyclePathNetwork.Seasons3],
};

const MapLegend = () => (
  <div className='MapLegend'>
    <div className="Line" style={Season4Style}/><div className="Label">4 Saisons (déneigé)</div>
    <div className="Line" style={Season3Style}/><div className="Label">3 Saisons</div>
  </div>
);

export default MapLegend;