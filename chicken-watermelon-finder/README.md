# 🍗🍉 Chicken & Watermelon Finder

A cross-platform (Android + iOS) mobile app that finds the closest **fried chicken**
and **watermelon** spots near you and plots them on a map, with a distance-sorted list
and one-tap directions.

Built with **React Native + Expo** and **Google Maps / Places**.

---

## Features

- 📍 Uses your current location (with permission).
- 🗺️ Interactive map with color-coded pins — golden 🍗 for fried chicken, red 🍉 for watermelon.
- 📋 Bottom sheet listing every spot, sorted by distance, with ratings and address.
- 🔀 Toggle chips to show/hide each category.
- 🧭 "Go" button on each result opens native turn-by-turn directions.
- 🔁 Pluggable data layer (`src/services/placesService.js`) so you can swap Google for another provider.

---

## Project structure

```
chicken-watermelon-finder/
├── App.js                      # App entry, safe-area wrapper
├── app.json                    # Expo config (permissions, map keys)
├── eas.json                    # Build profiles for EAS Build
├── .env.example                # Template for your API key
└── src/
    ├── config.js               # API key + categories + search radius
    ├── hooks/
    │   └── useLocation.js       # Location permission + current position
    ├── services/
    │   └── placesService.js     # Google Places fetch + normalization
    ├── utils/
    │   └── distance.js          # Haversine distance + formatting
    └── components/
        ├── MapScreen.js         # Map + filters + results sheet
        └── PlaceCard.js         # A single result row
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- The [Expo Go](https://expo.dev/go) app on your phone (for quick testing), or Android Studio / Xcode for native builds
- A **Google Cloud API key** with these APIs enabled:
  - Places API
  - Maps SDK for Android
  - Maps SDK for iOS

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Add your Google key
#    Option A — edit app.json:
#      expo.extra.googlePlacesApiKey        -> your key
#      expo.ios.config.googleMapsApiKey     -> your iOS Maps key
#      expo.android.config.googleMaps.apiKey-> your Android Maps key
#
#    Option B — copy .env.example to .env and set GOOGLE_PLACES_API_KEY

# 3. Start the dev server
npm start
```

Then scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

> **Note:** `react-native-maps` with the Google provider needs a native build to render
> Google tiles on iOS. For a full test, create a development build:
> ```bash
> npx expo install expo-dev-client
> npx eas build --profile development --platform android   # or ios
> ```

---

## Building release apps

Using [EAS Build](https://docs.expo.dev/build/introduction/):

```bash
npm install -g eas-cli
eas login
eas build --platform android      # produces an .aab / .apk
eas build --platform ios          # produces an .ipa (needs an Apple account)
```

Build profiles are defined in `eas.json`.

---

## Customizing what it searches for

Open `src/config.js` and edit the `CATEGORIES` array — each entry has a `query`
(what gets sent to Places), an `emoji`, and a pin `color`. Change `SEARCH_RADIUS_METERS`
to widen or tighten the search.

---

## Swapping the data provider

All Google-specific code lives in `src/services/placesService.js`. The rest of the app
only sees the normalized shape returned by `normalizePlace()`. To use a free source like
OpenStreetMap's Overpass API, reimplement `fetchCategory()` and `normalizePlace()` and
keep the output shape the same.

---

## License

MIT
