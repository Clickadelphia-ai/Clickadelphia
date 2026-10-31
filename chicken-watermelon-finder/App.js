import React from 'react';
import { SafeAreaView, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import MapScreen from './src/components/MapScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      <MapScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
});
