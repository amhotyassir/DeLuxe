import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ManageServices from '../components/ManageServices';
import ArchiveSection from '../components/ArchiveSection';

const SettingsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <ManageServices />
      <ArchiveSection />
      {/* Add more sections here as needed */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    marginBottom:20,
  },
});

export default SettingsScreen;
