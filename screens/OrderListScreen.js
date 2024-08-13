import React, { useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Modal, Alert, Dimensions , TouchableOpacity} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAppContext } from '../context/AppContext';
import OrderListComponent from '../components/OrderListComponent';

const { width, height } = Dimensions.get('window');

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
          <Text>{selectedStatus}</Text>
          <RNPickerSelect
            onValueChange={(value) => setSelectedStatus(value)}
            items={[
              { label: 'All', value: 'All' },
              { label: 'New', value: 'New' },
              { label: 'Waiting', value: 'Waiting' },
              { label: 'Ready', value: 'Ready' },
            ]}
            style={styles.pickerSelectStyles}
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
        return '#1e90ff'; // Light Blue
      default:
        return '#fff';
    }
  };

  const getNextStatusColor = (status) => {
    switch (status) {
      case 'New':
        return '#A9A9A9'; // Dark Gray (Waiting)
      case 'Waiting':
        return '#1e90ff'; // Light Blue (Ready)
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
    setSelectedOrder(orders[index]);
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
          <OrderListComponent
            item={item}
            index={index}
            expandedOrders={expandedOrders}
            toggleExpandOrder={toggleExpandOrder}
            handleStatusChange={handleStatusChange}
            handleDeleteOrder={handleDeleteOrder}
            handleOpenLocation={handleOpenLocation}
            formatDateTime={formatDateTime}
            getStatusColor={getStatusColor}
            getNextStatusColor={getNextStatusColor}
            getNextStatus={getNextStatus}
          />
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
              <WebView source={{ uri: selectedOrder.location }} style={{ width: width * 0.9, height: height * 0.7 }} />
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
    alignItems: 'center',
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
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
  },
  pickerWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  pickerSelectStyles: {
    inputIOS: {
      fontSize: 16,
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30,
      maxWidth: 100,
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 4,
      color: 'black',
      paddingRight: 30,
      maxWidth: 100,
    },
    iconContainer: {
      top: 10,
      right: 12,
    },
  },
});

export default OrderListScreen;
