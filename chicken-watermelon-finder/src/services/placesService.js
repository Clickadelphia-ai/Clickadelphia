import {
  GOOGLE_PLACES_API_KEY,
  CATEGORIES,
  SEARCH_RADIUS_METERS,
} from '../config';
import { distanceMeters } from '../utils/distance';

const PLACES_ENDPOINT =
  'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

/**
 * Fetches nearby places for a single category using the Google Places
 * Nearby Search API, ranked by prominence within the search radius.
 *
 * @param {{latitude:number, longitude:number}} location
 * @param {object} category  one of CATEGORIES
 * @returns {Promise<Array>} normalized place objects
 */
async function fetchCategory(location, category) {
  const params = new URLSearchParams({
    key: GOOGLE_PLACES_API_KEY,
    location: `${location.latitude},${location.longitude}`,
    radius: String(SEARCH_RADIUS_METERS),
    keyword: category.query,
  });

  const res = await fetch(`${PLACES_ENDPOINT}?${params.toString()}`);
  const data = await res.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(
      `Places API error (${category.id}): ${data.status}` +
        (data.error_message ? ` - ${data.error_message}` : '')
    );
  }

  return (data.results || []).map((r) => normalizePlace(r, category, location));
}

/**
 * Turns a raw Google Places result into our own flat shape, so the UI
 * never depends on Google's response structure. Swap this + fetchCategory
 * to change data providers (e.g. OpenStreetMap / Overpass).
 */
function normalizePlace(raw, category, origin) {
  const coord = {
    latitude: raw.geometry.location.lat,
    longitude: raw.geometry.location.lng,
  };
  return {
    id: `${category.id}:${raw.place_id}`,
    placeId: raw.place_id,
    name: raw.name,
    category: category.id,
    categoryLabel: category.label,
    color: category.color,
    emoji: category.emoji,
    coordinate: coord,
    address: raw.vicinity || raw.formatted_address || '',
    rating: raw.rating ?? null,
    userRatingsTotal: raw.user_ratings_total ?? 0,
    openNow: raw.opening_hours?.open_now ?? null,
    distance: distanceMeters(origin, coord),
  };
}

/**
 * Fetches all configured categories in parallel and returns a single
 * list sorted by distance from the user.
 */
export async function findNearbyPlaces(location) {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error(
      'Missing Google Places API key. Set expo.extra.googlePlacesApiKey in app.json.'
    );
  }

  const results = await Promise.all(
    CATEGORIES.map((c) => fetchCategory(location, c))
  );

  return results
    .flat()
    .sort((a, b) => a.distance - b.distance);
}
