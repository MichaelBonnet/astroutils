/** 
  * Return type with latitude and longitude coordinates (in both degrees and radians) of the subsolar point for a given time.
  * 
  * @param latitude_rads Latitude (in radians) of the subsolar point
  * @param longitude_rads Longitude (in radians) of the subsolar point
  * @param latitude_degs Latitude (in degrees) of the subsolar point
  * @param longitude_degs Longitude (in degrees) of the subsolar point
  * 
  * @beta
  */
type LatLongFromRaDec = {
  latitude_rads: number;
  longitude_rads: number;
  latitude_degs: number;
  longitude_degs: number;
}

/** 
  * Return type with right ascension and declination of the Sun for a given time.
  * 
  * @param right_ascension Right Ascension of the Sun for a given time
  * @param declination Declination of the Sun for a given time
  * 
  * @beta
  */
type RaDec = {
  right_ascension: number;
  declination: number;
}

/**
  * Returns the right ascension and declination of the Sun given a date.
  *
  * @remarks
  * This method borrows heavily/outright copies from Greg Miller's source code at https://www.celestialprogramming.com/snippets/geographicPosition.html
  *
  * @param date - the UTC date for which to get relevant values. Uses JavaScript's Date object as type, but is interpreted as the count of milliseconds since the Unix epoch.
  * @returns {RaDec} The right ascension and declination of the Sun
  *
  * @beta
  */
function sunPosition(date: Date) {
  const sundate = date || new Date(Date.now()) // UTC in milliseconds from Jan 1 1970
  const jd = +sundate/86400000 + 2440587.5
  let n: number = jd - 2451545.0;
  let L: number = (280.466 + 0.9856474*n) % 360;
  let g: number = ((357.528+ 0.9856003*n) % 360) * rads;
  if( L < 0 ) { L += 360; }
  if( g < 0 ) { g += Math.PI * 2.0; }

  let lambda: number = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rads;
  let beta: number = 0.0;
  let epsilon: number = (23.440-0.0000004*n)*rads;
  let right_ascension: number = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
  let declination: number = Math.asin(Math.sin(epsilon) * Math.sin(lambda));
  if( right_ascension < 0 ) { right_ascension += Math.PI * 2; }

  let SunPosition: RaDec = {
    right_ascension: right_ascension,
    declination: declination,
  }

  return SunPosition;
}

/**
  * Returns the geographic coordinates in degrees and radians of the subsolar point given a GMST date.
  *
  * @remarks
  * This method borrows heavily/outright copies from Greg Miller's source code at https://www.celestialprogramming.com/snippets/geographicPosition.html
  *
  * @param right_ascension - The right ascension of the Sun.
  * @param declination - The declination of the Sun.
  * @param gmst - The Greenwich Mean Sidereal Time for the date in question.
  * @returns {LatLongFromRaDec} The latitude and longitude in both degrees and radians of the subsolar point.
  *
  * @beta
  */
function getGeographicPosition(right_ascension: number, declination: number, gmst: number){
  const latitude_rads = declination;
  let longitude_rads = right_ascension - gmst;

  if (longitude_rads > 2 * Math.PI){
    longitude_rads -= 2 * Math.PI;
  }
  if (longitude_rads > Math.PI){
    longitude_rads -= 2 * Math.PI;
  }
  if(longitude_rads < -Math.PI){
    longitude_rads += 2 * Math.PI;
  }

  let LatLong: LatLongFromRaDec = {
    latitude_rads: latitude_rads,
    longitude_rads: longitude_rads,
    latitude_degs: latitude_rads * degs,
    longitude_degs: longitude_rads * degs,
  }

  return LatLong;
}

/**
  * Returns the Earth Rotation Angle in radians given a GMST date.
  *
  * @remarks
  * This method borrows heavily/outright copies from Greg Miller's source code at https://www.celestialprogramming.com/snippets/geographicPosition.html
  *
  * @param date - the UTC date for which to get relevant values. Uses JavaScript's Date object as type, but is interpreted as the count of milliseconds since the Unix epoch.
  * @returns {LatLongFromRaDec} The latitude and longitude in both degrees and radians of the subsolar point.
  *
  * @beta
  */
function earthRotationAngle(date: Date){
    const sundate = date || new Date(Date.now()) // UTC in milliseconds from Jan 1 1970
    const jd = +sundate/86400000 + 2440587.5
    const t = jd - 2451545.0;
    
    const frac = jd % 1.0;
    
    let era: number = ((Math.PI * 2) * (0.7790572732640 + 0.00273781191135448 * t + frac)) % (2 * Math.PI);
    if( era < 0 ) { era += Math.PI * 2 };
    
    return era;
}

/**
  * Returns the Greenwich Mean Sidereal Time for a given UTC timestamp.
  *
  * @remarks
  * This method borrows heavily/outright copies from Greg Miller's source code at https://www.celestialprogramming.com/snippets/geographicPosition.html
  *
  * @param date - the UTC date for which to get relevant values. Uses JavaScript's Date object as type, but is interpreted as the count of milliseconds since the Unix epoch.
  * @returns gmst - The Greenwich Mean Sidereal Time for the given UTC timestamp.
  *
  * @beta
  */
function greenwichMeanSiderealTime(date: Date){
  //The IAU Resolutions on Astronomical Reference Systems, Time Scales, and Earth Rotation Models Explanation and Implementation (George H. Kaplan)
  //https://arxiv.org/pdf/astro-ph/0602086.pdf
  const sundate = date || new Date(Date.now()) // UTC in milliseconds from Jan 1 1970
  const jd = +sundate/86400000 + 2440587.5

  const t = (+jd - 2451545.0) / 36525.0;
  const era = earthRotationAngle(date);

  // EQ 2.12
  let gmst: number = (era + (0.014506 + (4612.15739966 * t) + (1.39667721 * t*t) + (-0.00009344 * t*t*t) + (0.00001882 * t*t*t*t)) / 60 / 60 * (Math.PI / 180)) % (2 * Math.PI);
  if ( gmst < 0 ) { gmst += 2 * Math.PI };

  return gmst;
}

/**
   * Returns returns the latitude and longitude of the subsolar point at given a timestamp, in both degrees and radians..
   *
   * @remarks
   * This method borrows heavily/outright copies from Greg Miller's source code at https://www.celestialprogramming.com/snippets/geographicPosition.html
   *
   * @param sundate - the UTC date for which to get relevant values. Uses JavaScript's Date object as type, but is interpreted as the count of milliseconds since the Unix epoch.
   * @returns {LatLongFromRaDec} Latitude (in both degrees and radians) and longitude (in both degrees and radians) of the subsolar point.
   *
   * @beta
   */
export function computeSubsolarPointCoordinatesWithGMST(sundate: Date) {   
  const sun = sunPosition(sundate);
  const gmst = greenwichMeanSiderealTime(sundate);
  let gp = getGeographicPosition(sun.right_ascension, sun.declination, gmst);
  return gp;
}
