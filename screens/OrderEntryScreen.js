import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Dimensions } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAppContext } from '../context/AppContext';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

const OrderEntryScreen = ({ navigation }) => {
  const { addOrder } = useAppContext();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [service, setService] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const locationUrl = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
    setCustomerLocation(locationUrl);
    setModalVisible(true);
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setService('');
    setCustomerLocation('');
  };

  const handleAddOrder = () => {
    if (!customerName || !customerPhone || !customerLocation || !service) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (customerPhone.length !== 10 || !/^\d+$/.test(customerPhone)) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits');
      return;
    }

    const newOrder = {
      name: customerName,
      phone: customerPhone,
      location: customerLocation,
      services: { [service]: true },
      status: 'New',
      orderDate: new Date().toISOString(),
    };

    addOrder(newOrder)
      .then(() => {
        Alert.alert('Success', 'Order added successfully');
        resetForm();
        navigation.navigate('OrderList', { refresh: true });
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to add order');
        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Customer Name</Text>
      <TextInput
        style={styles.input}
        value={customerName}
        onChangeText={setCustomerName}
        placeholder="Enter customer name"
      />

      <Text style={styles.label}>Customer Phone</Text>
      <TextInput
        style={styles.input}
        value={customerPhone}
        onChangeText={setCustomerPhone}
        placeholder="Enter customer phone"
        keyboardType="number-pad"
        maxLength={10}
      />

      <Text style={styles.label}>Customer Location</Text>
      <TextInput
        style={styles.input}
        value={customerLocation}
        placeholder="Current location will be set"
        editable={false}
      />
      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
      >
        <Ionicons name="location" size={20} color="white" />
        <Text style={styles.buttonText}>Set Location</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Service</Text>
      <RNPickerSelect
        onValueChange={(value) => setService(value)}
        items={[
          { label: 'Laundry', value: 'Laundry' },
          { label: 'Dry Cleaning', value: 'Dry Cleaning' },
          { label: 'Ironing', value: 'Ironing' },
          { label: 'Others', value: 'Others' },
        ]}
        style={pickerSelectStyles}
        value={service}
        placeholder={{
          label: 'Select a service...',
          value: null,
        }}
      />

      <TouchableOpacity style={styles.button} onPress={handleAddOrder}>
        <Ionicons name="add-circle" size={20} color="white" />
        <Text style={styles.buttonText}>Add Order</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <WebView
              source={{ uri: customerLocation }}
              style={{ width: width * 0.9, height: height * 0.7 }}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Ionicons name="close-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 16,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 16,
  },
});

export default OrderEntryScreen;
