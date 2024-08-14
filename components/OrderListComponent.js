import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Linking } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');
const itemWidth = width * 0.9;

const OrderListComponent = ({
  item,
  index,
  expandedOrders,
  toggleExpandOrder,
  handleStatusChange,
  handleDeleteOrder,
  handleOpenLocation,
  formatDateTime,
  getStatusColor,
  getNextStatusColor,
  getNextStatus,
}) => {
  const { services,currency } = useAppContext();
  const renderServicesTable = (order_services) => {
    // console.log('order_services = ',order_services)
    let grandTotal=0
    const detailedServices =  order_services.map((order_service, index) => {

      // console.log(order_service)
      const key = order_service.id
      const service = services[key];
      // console.log(service)
      const total = service.type === 'perSquareMeter' 
        ? Number(order_service.length)* Number(order_service.width) * Number(service.price)
        : Number(order_service.quantity) * Number(service.price);
      grandTotal = grandTotal + total
      return (
        <View key={index + '/' + key} style={styles.serviceRow}>
          <Text style={styles.serviceCell}>{service.name}</Text>
          <Text style={styles.serviceCell}>{service.type === 'perSquareMeter' 
        ?  order_service.length  + ' x ' +  order_service.width + ' m²'
        :  order_service.quantity+ ' Pcs'}</Text>
          <Text style={styles.serviceCell}>{total.toFixed(0)} {currency}</Text>
        </View>
      );
      
    });

    return <View>
      {detailedServices}
      <Text style={styles.totalLabel}>{grandTotal}{currency}</Text>
    </View>

  };

  return (
    <View
      style={[
        styles.customerItem,
        {
          borderLeftColor: getStatusColor(item.status),
          backgroundColor: expandedOrders[item.id] ? '#f2f2f2' : '#fff',
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.customerName}>
          {index + 1}. {item.name.length > 10 ? `${item.name.substring(0, 8)}...` : item.name}
        </Text>
        <View style={styles.headerRight}>
          <Text style={[styles.status, { backgroundColor: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
          <TouchableOpacity onPress={() => toggleExpandOrder(item.id, index)}>
            <Ionicons name={expandedOrders[item.id] ? 'chevron-up' : 'chevron-down'} size={24} color="blue" />
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
            <Text onPress={() => Linking.openURL(`tel:${item.phone}`)} style={[styles.value, styles.link]}>
              {item.phone}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text onPress={() => handleOpenLocation(item.location)} style={[styles.value, styles.link]}>
              View
            </Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Order Date:</Text>
            <Text style={styles.value}>{formatDateTime(item.orderDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{item.status}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Services:</Text>
            
          </View>
          <View style={styles.serviceTable}>
              
              {renderServicesTable(item.services)}
            </View>
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#FF0000', marginLeft: 8 }]}
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
              <Text style={styles.buttonText}>
                {item.status === 'Ready' ? 'Delivered' : getNextStatus(item.status)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  customerItem: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    borderLeftWidth: 5,
    width: itemWidth,
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
    backgroundColor: '#f2f2f2',
    padding: 10,
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
  serviceTable: {
    flex:1,
    marginBottom:15,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceCell: {
    width: '33%',
    textAlign: 'center',
    textAlignVertical:'center',
  },
  serviceHeader: {
    fontWeight: 'bold',
    width: '33%',
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default OrderListComponent;
