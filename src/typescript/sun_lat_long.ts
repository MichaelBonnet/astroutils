// Type for returning the apparent coordinates of the Sun's location in the sky
type SunLatLong = {
  /** Longitude of the sun's apparent position in degrees */
  latitude: number;
  /** Latitude of the sun's apparent position in degrees */
  longitude: number;
}

// Type for returning the unit vector pointing from the observer to the center of the Sun
type ObserverSunUnitVector = {
  s_x: number;
  s_y: number;
  s_z: number;
}

// Type for returning the altitude and azimuth of the Sun for an observer
type SunAltAzi = {
  /** Altitude  of the Sun from the horizon in degrees from the observer's perspective */
  altitude: number;
  /** Azimuth of the Sun in degrees (south-clockwise convention) from the observer's perspective */
  azimuth: number;
}

/**
   * Returns the sun coordinates given a date.
   *
   * @remarks
   * This method is adapted from the FORTRAN code in a paper by NASA workers Zhang, Stackhouse Jr., Macpherson, and Mikovitz, which can be found at https://doi.org/10.1016/j.renene.2021.03.047
   *
   * @param date - the UTC date for which to get relevant values. Uses JavaScript's Date object as type, but is interpreted as the count of milliseconds since the Unix epoch.
   * @returns The coordinates (in degrees) of the sun in the sky using 0 N, 0 E as origin
   *
   * @beta
   */
export function date_to_sun_lat_long(date: Date) {
  const degs = 180 / Math.PI
  const rads = Math.PI / 180
  
  const sundate = date || new Date(Date.now()) // UTC in milliseconds from Jan 1 1970
  const jd = +sundate/86400000 + 2440587.5
  const n = jd - 2451545.0 // fractional days since J2000
  let L: number = (280.466 + 0.9856474 * n) % 360
  let g: number = (357.528 + 0.9856003 * n) % 360
  let lambda: number = (L + (1.915 * Math.sin(g * rads)) + 0.020 * Math.sin(2 * g * rads)) % 360
  let epsilon: number = 23.440 - 0.0000004 * n
  let alpha: number = (Math.atan2(Math.cos(epsilon * rads) * Math.sin(lambda * rads), Math.cos(lambda * rads)) * degs) % 360 // alpha in same quadrant as lambda
  let delta: number = Math.asin(Math.sin(epsilon * rads) * Math.sin(lambda * rads)) * degs
  let e_min: number = (((L - alpha) + 180) % 360) - 180 // in degrees

  let T_gmt: number = sundate.getUTCHours() + (sundate.getUTCMinutes() / 60) + (sundate.getUTCSeconds() / 3600) // decimal hours since beginning of UTC day in question

  let subsolar_point_lat: number = delta // Degrees
  let subsolar_point_lon: number = (-15 * (T_gmt - 12 + (e_min * 4 / 60))) % 360 // Degrees

  let SunLatLong: SunLatLong = {
    latitude: subsolar_point_lat,
    longitude: subsolar_point_lon,
  }

  return SunLatLong
}

/**
   * Returns the sun coordinates, unit bector from observer to sun, and alitude and azimuth of the sun given a date and observer coordinates.
   *
   * @remarks
   * This method is adapted from the FORTRAN code in a paper by NASA workers Zhang, Stackhouse Jr., Macpherson, and Mikovitz, which can be found at https://doi.org/10.1016/j.renene.2021.03.047
   *
   * @param date - the UTC date for which to get relevant values. Uses JavaScript's Date object as type, but is interpreted as the count of milliseconds since the Unix epoch.
   * @param observer_lat - The latitude of the observer on Earth, measured in degrees
   * @param observer_lon - The longitude of the observer on Earth, measured in degrees
   * @returns (1) The coordinates (in degrees) of the sun in the sky using 0 N, 0 E as origin
   *          (2) The unit vector pointing from the observer to the center of the Sun
   *          (3) The altitude and azimuth of the sun from the observer's point of view
   *
   * @beta
   */
export function get_SunCoords_SunUnitVector_SunAziElev(date: Date, observer_lat: number, observer_lon: number) {
  const degs = 180 / Math.PI
  const rads = Math.PI / 180
  
  const sundate = date || new Date(Date.now())
  const sun_lat_long = date_to_sun_lat_long(sundate)
  const phi_s = sun_lat_long.latitude
  const lambda_s = sun_lat_long.longitude
  const phi_o = observer_lat
  const lambda_o = observer_lon

  type AllValues = {
    SunLatLong: SunLatLong,
    ObserverSunUnitVector: ObserverSunUnitVector,
    SunAltAzi: SunAltAzi
  }
  
  let ObserverSunUnitVector: ObserverSunUnitVector = {
    s_x: Math.cos(phi_s * rads) * Math.sin((lambda_s * rads) - (lambda_o * rads)),
    s_y: (Math.cos(phi_o * rads) * Math.sin(phi_s * rads)) - (Math.sin(phi_o * rads) * Math.cos(phi_s * rads) * Math.cos((lambda_s * rads) - (lambda_o * rads))),
    s_z: (Math.sin(phi_o * rads) * Math.sin(phi_s * rads)) + (Math.cos(phi_o * rads) * Math.cos(phi_s * rads) * Math.cos((lambda_s * rads) - (lambda_o * rads)))
  }

  let SunAltAzi: SunAltAzi = {
    altitude: Math.acos(ObserverSunUnitVector.s_z * rads) / rads,
    azimuth: Math.atan2(-ObserverSunUnitVector.s_x * rads, -ObserverSunUnitVector.s_y * rads) / rads,
  }

  let AllVals: AllValues = {
    SunLatLong: sun_lat_long,
    ObserverSunUnitVector: ObserverSunUnitVector,
    SunAltAzi: SunAltAzi,
  }

  return AllVals
}
