
export interface WithContinuation {
  /** The next continuation token. */
  nextToken?: string;
}
export interface ContinuationArray<T> extends WithContinuation {
  items: T[];
}

export enum BicyclePathType {
  Unknown = "unknown",
  ChausseeDesignee = "chaussee-designee",
  AccotementAsphalte = "accotement-asphalte",
  BandeCyclable = "bande-cycleable",
  PisteCyclableSurRue = "piste-cyclable-rue",
  PisteCyclableEnSitePropre = "piste-cyclable-site-propre",
  PisteCyclableAuNiveauDuTrottoir = "piste-cyclable-trottoir",
  SentierPolyvalent = "sentier-polyvalent",
  Velorue = "velorue",
}

export enum BicyclePathDivider {
  Unknown = "unknown",
  Mail = "mail",
  Delineateur = "delineateur",
  MarquageAuSol = "marquage-sol",
  Cloture = "cloture",
  Jersey = "jersey",
}

export enum BicyclePathNetwork {
  Unknown = "unknown",
  Seasons3 = "3-seasons",
  Seasons4 = "4-seasons",
}

/** A bicycle path. */
export interface BicyclePath {
  /** The name of the borough. */
  borough: string;

  /** The divider type. */
  divider: BicyclePathDivider;

  /**
   * The GeoJson geometry.
   * Be careful - GeoJson Positions are [long, lat, elevation]
   */
  geometry: {
    type: "MultiLineString";
    coordinates: Position[][];
  };

  /** Unique id for the bicycle path */
  id: string;

  /** The length in meters */
  length: number;

  /** The number of lanes */
  numberOfLanes: number;

  /** Which network does this bicycle path belong to. */
  network: BicyclePathNetwork;

  /** The type of bicycle path */
  type: BicyclePathType;
}

/** Status for an observation. */
export enum ObservationStatus {
  Ok = "ok",
  Ko = "ko",
}

export enum ObservationAttributes {
  Snow = "snow",
  Ice = "ice",
}

/** Base definition for observations. */
export interface ObservationBase {
  /** Attributes to further characterize the observation. */
  attributes?: ObservationAttributes[];
  /** Free-form comments. */
  comment?: string;
  /** A device identifier (the reporting device). */
  deviceId: string;
  /**
   * A GeoJSON position for the observation.
   * Be careful - GeoJson Positions are [long, lat, elevation]
   */
  position: Position;
  /** A timestamp of when the observation was done. Unix Epoch in seconds. */
  timestamp: number;
}

/** A reported observation */
export interface ReportedObservation extends ObservationBase {
  /** Unique id */
  id: string;
  /** Associated assets. */
  assets?: ReportedObservationAsset[];
}

export enum AssetContentType {
  Jpeg = "image/jpeg",
  Png = "image/png",
}

export interface ObservationAssetBase {
  /**
   * The asset content-type
   */
  contentType: AssetContentType;
}

/** An asset attached alongside a ReportedObservation. */
export interface ReportedObservationAsset extends ObservationAssetBase {
  /** Base-64 encoded data. */
  url: string;
}
