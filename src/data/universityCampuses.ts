export interface UniversityCampus {
  name: string;
  latitude: number;
  longitude: number;
  diameterMiles: number; // Approximate diameter of campus area
}

export const universityCampuses: Record<string, UniversityCampus> = {
  "George Washington University": {
    name: "George Washington University",
    latitude: 38.8996,
    longitude: -77.0486,
    diameterMiles: 1.2
  },
  "Georgetown University": {
    name: "Georgetown University",
    latitude: 38.9076,
    longitude: -77.0723,
    diameterMiles: 1.0
  },
  "American University": {
    name: "American University",
    latitude: 38.9375,
    longitude: -77.0866,
    diameterMiles: 1.5
  },
  "Howard University": {
    name: "Howard University",
    latitude: 38.9216,
    longitude: -77.0198,
    diameterMiles: 1.0
  },
  "Catholic University of America": {
    name: "Catholic University of America",
    latitude: 38.9348,
    longitude: -76.9955,
    diameterMiles: 1.2
  },
  "University of Maryland": {
    name: "University of Maryland",
    latitude: 38.9869,
    longitude: -76.9426,
    diameterMiles: 2.0
  },
  "Johns Hopkins University": {
    name: "Johns Hopkins University",
    latitude: 39.3299,
    longitude: -76.6205,
    diameterMiles: 1.5
  },
  "University of Virginia": {
    name: "University of Virginia",
    latitude: 38.0336,
    longitude: -78.5080,
    diameterMiles: 2.5
  },
  "Virginia Tech": {
    name: "Virginia Tech",
    latitude: 37.2284,
    longitude: -80.4234,
    diameterMiles: 3.0
  },
  "George Mason University": {
    name: "George Mason University",
    latitude: 38.8303,
    longitude: -77.3076,
    diameterMiles: 2.0
  }
};
