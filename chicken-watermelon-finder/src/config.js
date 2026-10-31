import Constants from 'expo-constants';

/**
 * Reads the Google Places API key from app config (app.json -> expo.extra)
 * or from an environment variable at build time.
 *
 * Set your key in one of these places:
 *   1. app.json  ->  expo.extra.googlePlacesApiKey
 *   2. .env       ->  GOOGLE_PLACES_API_KEY  (with a loader such as dotenv)
 */
export const GOOGLE_PLACES_API_KEY =
  Constants.expoConfig?.extra?.googlePlacesApiKey ||
  process.env.GOOGLE_PLACES_API_KEY ||
  '';

// The two things we look for. Each category drives a Places text query and a
// pin color so results are easy to tell apart on the map.
export const CATEGORIES = [
  {
    id: 'chicken',
    label: 'Fried Chicken',
    query: 'fried chicken',
    emoji: '🍗',
    color: '#E8A33D', // golden
  },
  {
    id: 'watermelon',
    label: 'Watermelon',
    query: 'watermelon',
    emoji: '🍉',
    color: '#E74C3C', // red
  },
];

// How far out to search, in meters.
export const SEARCH_RADIUS_METERS = 8000;
