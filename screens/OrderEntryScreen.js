import React, { useState, useLayoutEffect, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Dimensions, ScrollView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAppContext } from '../context/AppContext';
import * as Location from 'expo-location';
import ServiceInput from '../components/ServiceInput';

const { width, height } = Dimensions.get('window');

const OrderEntryScreen = ({ navigation }) => {
  const { addOrder, services, currency } = useAppContext();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [serviceDetails, setServiceDetails] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [total, setTotal] = useState(0)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity style={styles.addButton} onPress={handleAddOrder}>
          <Ionicons name="add-circle" size={20} color="white" />
          <Text style={styles.buttonText}>Add Order</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleAddOrder, customerLocation, customerName, customerPhone, serviceDetails, selectedServices]);

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
    setSelectedServices([]);
    setServiceDetails({});
    setCustomerLocation('');
  };

  const handleAddOrder = () => {
    if (!customerName || !customerPhone || !customerLocation || selectedServices.length === 0) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (customerPhone.length !== 10 || !/^\d+$/.test(customerPhone)) {
      Alert.alert('Error', 'Phone number must be exactly 10 digits');
      return;
    }
    console.log(total)
    if (!total){
      Alert.alert('Error', 'Check Services Quantities')
      return
    }


    const newOrder = {
      name: customerName,
      phone: customerPhone,
      location: customerLocation,
      services: serviceDetails,
      status: 'New',
      orderDate: new Date().toISOString(),
    };

    addOrder(newOrder)
      .then(() => {
        Alert.alert('Success', 'Order added successfully');
        resetForm();
        navigation.navigate('OrderList', { refresh: true }); // Pass a refresh parameter
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to add order');
        console.error(error);
      });
  };
  const isDecimal = (value) => /^\d+(\.\d{1,2})?$/.test(value);


  const calculateTotal = () => {
    let globalTotal = 0

    Object.keys(serviceDetails).map((key) => {
      const serviceDetail = serviceDetails[key]

      let total = 0;

      if (services[key].type === 'perSquareMeter') {
        const length = serviceDetail?.length;
        const width = serviceDetail?.width;
        if (isDecimal(length) && isDecimal(width)) {
          total = length * width * services[key].price;
        } else {
          total = NaN;
        }
      } else {
        if (isDecimal(serviceDetail)) {
          total = serviceDetail * services[key].price;
        } else {
          total = NaN;
        }

      }
      globalTotal = globalTotal + total
    })
    return globalTotal

  }

    useEffect(() => {
      setTotal(calculateTotal());
    }, [serviceDetails, selectedServices]);

    const handleServiceChange = (serviceId, value) => {
      setServiceDetails((prevDetails) => ({
        ...prevDetails,
        [serviceId]: value,
      }));
    };

    const handleServiceDelete = (serviceId) => {
      setSelectedServices((prevServices) => prevServices.filter((id) => id !== serviceId));
      setServiceDetails((prevDetails) => {
        const { [serviceId]: _, ...rest } = prevDetails;
        return rest;
      });
    };

    const handleServiceSelect = (serviceId) => {
      if (serviceId) {
        setSelectedServices((prevServices) => [...prevServices, serviceId]);
        const selectedService = services[serviceId];
        if (selectedService.type === 'perSquareMeter') {
          setServiceDetails((prevDetails) => ({
            ...prevDetails,
            [serviceId]: { length: 1, width: 1 },
          }));
        } else {
          setServiceDetails((prevDetails) => ({
            ...prevDetails,
            [serviceId]: 1,
          }));
        }
      }
    };

    return (
      <ScrollView style={styles.container}>
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
        {/* <TextInput
          style={styles.input}
          value={customerLocation}
          placeholder="Current location will be set"
          editable={false}
        /> */}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={getCurrentLocation}
        >
          <Ionicons name="location" size={20} color="white" />
          <Text style={styles.buttonText}>Set Location</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Services</Text>
        <RNPickerSelect
          onValueChange={handleServiceSelect}
          items={Object.keys(services).map((key) => ({
            label: services[key].name,
            value: key,
          }))}
          style={pickerSelectStyles}
          value={null}
          placeholder={{
            label: 'Select a service...',
            value: null,
          }}
        />

        {selectedServices.map((serviceId, index) => (
          <ServiceInput
            key={serviceId}
            service={{ id: serviceId, ...services[serviceId] }}
            serviceDetail={serviceDetails[serviceId]}
            onServiceDetailChange={handleServiceChange}
            onDelete={handleServiceDelete}
          />
        ))}

        <Text style={styles.totalLabel}>Total: {isNaN(total) ? 'Invalid input' : `${total.toFixed(0)} ${currency}`}</Text>


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
      </ScrollView>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#32cd32',
      borderRadius: 8,
      padding: 8,
      marginRight: 10,
    },
    buttonText: {
      color: 'white',
      marginLeft: 8,
      fontSize: 16,
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
    locationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#2196F3',
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
    },
    serviceInputContainer: {
      marginBottom: 16,
    },
    serviceLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
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
    totalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
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
