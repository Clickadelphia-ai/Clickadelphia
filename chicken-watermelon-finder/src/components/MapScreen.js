import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { findNearbyPlaces } from '../services/placesService';
import { CATEGORIES } from '../config';
import PlaceCard from './PlaceCard';

export default function MapScreen() {
  const { location, error: locError, loading: locLoading, refresh } = useLocation();
  const mapRef = useRef(null);

  const [places, setPlaces] = useState([]);
  const [placesError, setPlacesError] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [activeCategories, setActiveCategories] = useState(
    () => new Set(CATEGORIES.map((c) => c.id))
  );

  // Load places whenever we have a location.
  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    (async () => {
      setFetching(true);
      setPlacesError(null);
      try {
        const results = await findNearbyPlaces(location);
        if (!cancelled) setPlaces(results);
      } catch (e) {
        if (!cancelled) setPlacesError(e.message);
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location]);

  const focusPlace = useCallback((place) => {
    setSelectedId(place.id);
    mapRef.current?.animateToRegion(
      {
        ...place.coordinate,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      350
    );
  }, []);

  const toggleCategory = (id) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const visiblePlaces = places.filter((p) => activeCategories.has(p.category));

  const initialRegion = location
    ? { ...location, latitudeDelta: 0.08, longitudeDelta: 0.08 }
    : undefined;

  if (locLoading) {
    return (
      <Centered>
        <ActivityIndicator size="large" color="#E8A33D" />
        <Text style={styles.statusText}>Finding your location…</Text>
      </Centered>
    );
  }

  if (locError) {
    return (
      <Centered>
        <Text style={styles.errorTitle}>📍 Location needed</Text>
        <Text style={styles.statusText}>{locError}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </Centered>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {visiblePlaces.map((p) => (
          <Marker
            key={p.id}
            coordinate={p.coordinate}
            title={p.name}
            description={`${p.categoryLabel}${p.rating ? ` · ⭐ ${p.rating}` : ''}`}
            pinColor={p.color}
            onPress={() => setSelectedId(p.id)}
          />
        ))}
      </MapView>

      {/* Category filter chips */}
      <View style={styles.chipRow}>
        {CATEGORIES.map((c) => {
          const active = activeCategories.has(c.id);
          return (
            <TouchableOpacity
              key={c.id}
              style={[
                styles.chip,
                { borderColor: c.color },
                active && { backgroundColor: c.color },
              ]}
              onPress={() => toggleCategory(c.id)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {c.emoji} {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom results sheet */}
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>
          {fetching
            ? 'Searching nearby…'
            : `${visiblePlaces.length} spots near you`}
        </Text>

        {placesError ? (
          <Text style={styles.sheetError}>{placesError}</Text>
        ) : fetching ? (
          <ActivityIndicator style={{ marginVertical: 20 }} color="#E8A33D" />
        ) : (
          <FlatList
            data={visiblePlaces}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlaceCard
                place={item}
                onPress={focusPlace}
                selected={item.id === selectedId}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.sheetEmpty}>
                No spots found in range. Try toggling filters.
              </Text>
            }
          />
        )}
      </View>
    </View>
  );
}

function Centered({ children }) {
  return <View style={styles.centered}>{children}</View>;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FFF8E7',
  },
  statusText: { marginTop: 12, color: '#555', textAlign: 'center' },
  errorTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, color: '#333' },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#E8A33D',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  retryText: { color: '#fff', fontWeight: '700' },
  chipRow: {
    position: 'absolute',
    top: 54,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  chipText: { fontWeight: '600', color: '#333' },
  chipTextActive: { color: '#fff' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '42%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sheetError: { color: '#C0392B', padding: 16 },
  sheetEmpty: { color: '#999', padding: 24, textAlign: 'center' },
});
