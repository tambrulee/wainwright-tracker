export type WainwrightWeatherRegion = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

export const wainwrightWeatherRegions: WainwrightWeatherRegion[] = [
  { id: "central-fells", name: "Central Fells", lat: 54.5, lon: -3.08 },
  { id: "eastern-fells", name: "Eastern Fells", lat: 54.53, lon: -3.0 },
  { id: "far-eastern-fells", name: "Far Eastern Fells", lat: 54.51, lon: -2.86 },
  { id: "north-western-fells", name: "North Western Fells", lat: 54.58, lon: -3.22 },
  { id: "northern-fells", name: "Northern Fells", lat: 54.66, lon: -3.12 },
  { id: "southern-fells", name: "Southern Fells", lat: 54.43, lon: -3.18 },
  { id: "western-fells", name: "Western Fells", lat: 54.51, lon: -3.3 },
];