import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import { useAppContext } from '../context/AppContext';

const { width } = Dimensions.get('window');

const ServiceInput = ({ service, serviceDetail, onServiceDetailChange, onDelete }) => {
  const { id, name, price, type } = service;
  const { currency } = useAppContext();

  const isDecimal = (value) => /^\d+(\.\d{1,2})?$/.test(value);

  let total = 0;
  if (type === 'perSquareMeter') {
    const length = serviceDetail?.length;
    const width = serviceDetail?.width;
    if (isDecimal(length) && isDecimal(width)) {
      total = length * width * price;
    } else {
      total = NaN;
    }
  } else {
    if (isDecimal(serviceDetail)) {
      total = serviceDetail * price;
    } else {
      total = NaN;
    }
  }

  const handleDetailChange = (key, value) => {
    onServiceDetailChange(id, { ...serviceDetail, [key]: value });
  };
  

  return (
    <View style={styles.serviceInputContainer}>
      <Text style={styles.serviceLabel}>{name}</Text>
      {type === 'perSquareMeter' ? (
        <>
          <TextInput
            style={styles.input}
            value={String(serviceDetail?.length)}
            onChangeText={(value) => handleDetailChange('length', value)}
            placeholder="Length"
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            value={String(serviceDetail?.width)}
            onChangeText={(value) => handleDetailChange('width', value)}
            placeholder="Width"
            keyboardType="number-pad"
          />
        </>
      ) : (
        <TextInput
          style={styles.input}
          value={String(serviceDetail)}
          onChangeText={(value) => onServiceDetailChange(id, value)}
          placeholder="Quantity"
          keyboardType="number-pad"
        />
      )}
      <Text style={styles.total}>
        {isNaN(total) ? 'Invalid' : `${total.toFixed(0)} ${currency}`}
      </Text>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(id)}>
        <Ionicons name="trash" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  serviceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  serviceLabel: {
    fontSize: 16,
    width: '30%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    width: 50,
  },
  total: {
    fontSize: 16,
    textAlign: 'right',
  },
  deleteButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ServiceInput;
