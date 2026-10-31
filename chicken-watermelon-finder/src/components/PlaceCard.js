import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import { formatDistance } from '../utils/distance';

/**
 * A single row in the bottom list. Tapping it recenters the map (onPress),
 * and the Directions button opens the native maps app.
 */
export default function PlaceCard({ place, onPress, selected }) {
  const openDirections = () => {
    const { latitude, longitude } = place.coordinate;
    const label = encodeURIComponent(place.name);
    const url = Platform.select({
      ios: `maps://?daddr=${latitude},${longitude}&q=${label}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });
    const fallback = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    Linking.openURL(url).catch(() => Linking.openURL(fallback));
  };

  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={() => onPress(place)}
      activeOpacity={0.7}
    >
      <View style={[styles.emojiBadge, { backgroundColor: place.color }]}>
        <Text style={styles.emoji}>{place.emoji}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {place.categoryLabel} · {formatDistance(place.distance)}
          {place.rating ? `  ⭐ ${place.rating} (${place.userRatingsTotal})` : ''}
        </Text>
        {place.address ? (
          <Text style={styles.address} numberOfLines={1}>
            {place.address}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity style={styles.dirBtn} onPress={openDirections}>
        <Text style={styles.dirBtnText}>Go</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  cardSelected: {
    backgroundColor: '#FFF8E7',
  },
  emojiBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#222' },
  meta: { fontSize: 13, color: '#666', marginTop: 2 },
  address: { fontSize: 12, color: '#999', marginTop: 2 },
  dirBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginLeft: 8,
  },
  dirBtnText: { color: '#fff', fontWeight: '700' },
});
