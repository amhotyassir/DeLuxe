import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions,Image } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import { useAppContext } from '../context/AppContext';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

const ServiceInput = ({ index,service, serviceDetail, onServiceDetailChange, onDelete }) => {
  const {  name, price, type } = service;
  const { currency } = useAppContext();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      onServiceDetailChange({...serviceDetail, imageUri:imageUri})

    }
  };

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
    if (isDecimal(serviceDetail.quantity)) {
      total = serviceDetail.quantity * price;
    } else {
      total = NaN;
    }
  }

  const handleDetailChange = (key, value) => {
    
    onServiceDetailChange({ ...serviceDetail, [key]: Number(value) });
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
          value={String(serviceDetail?.quantity)}
          onChangeText={(value) => handleDetailChange('quantity', value)}
          placeholder="Quantity"
          keyboardType="number-pad"
        />
      )}
      <Text style={styles.total}>
        {isNaN(total) ? 'Invalid' : `${total.toFixed(0)} ${currency}`}
      </Text>
      <TouchableOpacity style={[{padding: (serviceDetail.imageUri ) ? 0 : 10 }, styles.miniImagePickerButton]} onPress={() => pickImage()}>
        {serviceDetail.imageUri ? <Image source={{ uri: serviceDetail.imageUri }} style={styles.miniServiceImage} /> : <Ionicons name="image" size={20} color="white" />}
            
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete()}>
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
  },miniServiceImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignSelf: 'center',
  },
  miniImagePickerButton:{
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
});

export default ServiceInput;
