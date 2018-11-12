import { ContinuationArray, ReportedObservation } from './entities';

export interface GetObservationsParams {
  startTs: number;
}

export const getObservations = async (params: GetObservationsParams): Promise<ContinuationArray<ReportedObservation>> => {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/v1/observations?startTs=${params.startTs}&sort=timestamp-desc`);
  return response.json();
};

export const getObservation = async (observationId: string): Promise<ReportedObservation | undefined> => {
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/api/v1/observations/${observationId}`);
  if (response.status === 404) {
    return undefined;
  }
  return response.json();
};
