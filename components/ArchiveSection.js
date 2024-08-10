import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const ArchiveSection = () => {
  const { deletedOrders, deliveredOrders } = useAppContext();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="archive" size={20} color="white" />
        <Text style={styles.buttonText}>View Archive</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Archived Orders</Text>
            <ScrollView style={styles.scrollView}>
              {deletedOrders.length > 0 || deliveredOrders.length > 0 ? (
                <>
                  {deletedOrders.map((order, index) => (
                    <View key={index} style={[styles.orderItem, styles.deletedOrder]}>
                      <Text style={[styles.orderText, styles.deletedOrderText]}><Text style={styles.boldText}>Name:</Text> {order.name}</Text>
                      <Text style={[styles.orderText, styles.deletedOrderText]}><Text style={styles.boldText}>Phone:</Text> {order.phone}</Text>
                      <Text style={[styles.orderText, styles.deletedOrderText]}><Text style={styles.boldText}>Location:</Text> {order.location}</Text>
                      <Text style={[styles.orderText, styles.deletedOrderText]}><Text style={styles.boldText}>Services:</Text> {Object.keys(order.services).join(', ')}</Text>
                      <Text style={[styles.orderText, styles.deletedOrderText]}><Text style={styles.boldText}>Order Date:</Text> {order.orderDate}</Text>
                      <Text style={[styles.orderText, styles.deletedOrderText]}><Text style={styles.boldText}>Status:</Text> {order.status}</Text>
                    </View>
                  ))}
                  {deliveredOrders.map((order, index) => (
                    <View key={index} style={[styles.orderItem, styles.deliveredOrder]}>
                      <Text style={[styles.orderText, styles.deliveredOrderText]}><Text style={styles.boldText}>Name:</Text> {order.name}</Text>
                      <Text style={[styles.orderText, styles.deliveredOrderText]}><Text style={styles.boldText}>Phone:</Text> {order.phone}</Text>
                      <Text style={[styles.orderText, styles.deliveredOrderText]}><Text style={styles.boldText}>Location:</Text> {order.location}</Text>
                      <Text style={[styles.orderText, styles.deliveredOrderText]}><Text style={styles.boldText}>Services:</Text> {Object.keys(order.services).join(', ')}</Text>
                      <Text style={[styles.orderText, styles.deliveredOrderText]}><Text style={styles.boldText}>Order Date:</Text> {order.orderDate}</Text>
                      <Text style={[styles.orderText, styles.deliveredOrderText]}><Text style={styles.boldText}>Status:</Text> {order.status}</Text>
                    </View>
                  ))}
                </>
              ) : (
                <Text style={styles.noOrdersText}>No archived orders.</Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
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
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A9A9A9',
    borderRadius: 8,
    padding: 16,
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  scrollView: {
    width: '100%',
  },
  orderItem: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
  },
  deletedOrder: {
    borderColor: 'red',
  },
  deletedOrderText: {
    color: 'red',
  },
  deliveredOrder: {
    borderColor: 'green',
  },
  deliveredOrderText: {
    color: 'green',
  },
  orderText: {
    fontSize: 16,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  noOrdersText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
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
});

export default ArchiveSection;
