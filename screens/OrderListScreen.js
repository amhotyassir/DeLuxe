import React, { useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, Modal, Alert, Dimensions, Linking } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');
const itemWidth = width * 0.9;

const OrderListScreen = ({ navigation }) => {
  const { orders, updateOrderStatus, addDeleted, loading } = useAppContext();
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.pickerWrapper}>
          <Text style={styles.statusText}>{selectedStatus}</Text>
          <RNPickerSelect
            onValueChange={(value) => setSelectedStatus(value)}
            items={[
              { label: 'All', value: 'All' },
              { label: 'New', value: 'New' },
              { label: 'Waiting', value: 'Waiting' },
              { label: 'Ready', value: 'Ready' },
            ]}
            style={{
              inputIOS: styles.input,
              inputAndroid: styles.input,
              iconContainer: styles.iconContainer,
            }}
            value={selectedStatus}
          />
        </View>
      ),
      title: 'Order List',
    });
  }, [navigation, selectedStatus]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.noOrdersContainer}>
        <Text style={styles.noOrdersText}>No Orders !!!</Text>
      </View>
    );
  }

  const filterOrders = (status) => {
    const activeOrders = orders.filter((order) => order.status !== 'Delivered' && order.status !== 'Deleted');
    let filteredOrders = activeOrders;

    if (status !== 'All') {
      filteredOrders = activeOrders.filter((order) => order.status === status);
    }

    return filteredOrders.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return '#FFA500'; // Orange
      case 'Waiting':
        return '#A9A9A9'; // Dark Gray
      case 'Ready':
        return '#1e90ff'; // Dodger Blue
      default:
        return '#fff';
    }
  };

  const getNextStatusColor = (status) => {
    switch (status) {
      case 'New':
        return '#A9A9A9'; // Dark Gray (Waiting)
      case 'Waiting':
        return '#1e90ff'; // Dodger Blue (Ready)
      case 'Ready':
        return '#32cd32'; // Lime Green (Delivered)
      default:
        return '#fff';
    }
  };

  const getNextStatus = (status) => {
    switch (status) {
      case 'New':
        return 'Waiting';
      case 'Waiting':
        return 'Ready';
      case 'Ready':
        return 'Delivered';
      default:
        return status;
    }
  };

  const filteredOrders = filterOrders(selectedStatus);

  const toggleExpandOrder = (id, index) => {
    setSelectedOrder(orders[index])
    
    setExpandedOrders((prevExpandedOrders) => ({
      ...prevExpandedOrders,
      [id]: !prevExpandedOrders[id],
    }));
  };

  const handleStatusChange = (orderId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    Alert.alert(
      "Confirm Status Change",
      `Are you sure you want to change the status to ${nextStatus}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => updateOrderStatus(orderId, nextStatus)
        }
      ],
      { cancelable: false }
    );
  };

  const handleDeleteOrder = (order) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this order?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            addDeleted(order)
              .then(() => {
                Alert.alert('Success', 'Order deleted successfully');
              })
              .catch((error) => {
                Alert.alert('Error', 'Failed to delete order');
                console.error(error);
              });
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleOpenLocation = (locationUrl) => {
    setLocationModalVisible(true);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item, index) => item.id}
        renderItem={({ item, index }) => (
          <View style={[
              styles.customerItem, 
              { 
                borderLeftColor: getStatusColor(item.status),
                backgroundColor: expandedOrders[item.id] ? '#f0f0f0' : '#fff',
              }
            ]}>
            <View style={styles.header}>
              <Text style={styles.customerName}>{index + 1}. {item.name.length > 10 ? `${item.name.substring(0, 8)}...` : item.name}</Text>
              <View style={styles.headerRight}>
                <Text style={[styles.status, { backgroundColor: getStatusColor(item.status) }]}>{item.status}</Text>
                <TouchableOpacity onPress={() => toggleExpandOrder(item.id,index)}>
                  <Ionicons name={expandedOrders[item.id] ? "chevron-up" : "chevron-down"} size={24} color="blue" />
                </TouchableOpacity>
              </View>
            </View>
            {expandedOrders[item.id] && (
              <View style={styles.details}>
                <View style={styles.row}>
                  <Text style={styles.label}>Full Name:</Text>
                  <Text style={styles.value}>{item.name}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text onPress={() => Linking.openURL(`tel:${item.phone}`)} style={[styles.value, styles.link]}>{item.phone}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Location:</Text>
                  <Text onPress={() => handleOpenLocation(item.location)} style={[styles.value, styles.link]}>View</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Services:</Text>
                  <Text style={styles.value}>{Object.keys(item.services).join(', ')}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Order Date:</Text>
                  <Text style={styles.value}>{formatDateTime(item.orderDate)}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#FF0000', marginRight: 8 }]}
                    onPress={() => handleDeleteOrder(item)}
                  >
                    <Ionicons name="trash" size={20} color="white" />
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: getNextStatusColor(item.status) }]}
                    onPress={() => handleStatusChange(item.id, item.status)}
                  >
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text style={styles.buttonText}>{item.status === 'Ready' ? 'Delivered' : getNextStatus(item.status)}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      />
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={locationModalVisible}
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {selectedOrder && (
              <WebView source={{ uri: selectedOrder.location }} 
              style={{ width: width * 0.9, height: height * 0.7 }} />
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setLocationModalVisible(false)}
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
    backgroundColor: '#fff',
    alignItems: 'center', // Center the content horizontally
  },
  noOrdersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  noOrdersText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'gray',
  },
  customerItem: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    borderLeftWidth: 5,
    width: itemWidth, // Use calculated width
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  status: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
  details: {
    marginTop: 8,
    backgroundColor: '#f0f0f0', // Light gray background for expanded items
    padding: 8,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    width: '40%',
    textAlign: 'left',
  },
  value: {
    width: '60%',
    textAlign: 'left',
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 8,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalText: {
    fontSize: 16,
    marginVertical: 4,
  },
  boldText: {
    fontWeight: 'bold',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF0000',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  webView: {
    width: '100%',
    height: '80%',
    borderRadius: 10,
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginRight: 10,
    maxWidth: 150,
  },
  input: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    maxWidth: 150, // Maximum width for the picker
  },
  statusText: {
    marginRight: 8,
    fontSize: 16,
  },
  iconContainer: {
    top: 10,
    right: 12,
  },
});

export default OrderListScreen;
