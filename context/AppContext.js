import React, { createContext, useState, useEffect, useContext } from 'react';
import { database } from '../services/firebaseConfig';
import { ref as dbRef, onValue, set, update } from 'firebase/database';
import * as Notifications from 'expo-notifications';

// Create the context
const AppContext = createContext();

const currency = 'MAD';
// Create a provider component
export const AppProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState({});
  const [admins, setAdmins] = useState({}); // State to manage admins

  useEffect(() => {
    // Listen for changes in the orders node
    const ordersRef = dbRef(database, 'orders');
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOrders(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    // Listen for changes in the delivered node
    const deliveredRef = dbRef(database, 'delivered');
    onValue(deliveredRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeliveredOrders(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setDeliveredOrders([]);
      }
    });

    // Listen for changes in the deleted node
    const deletedRef = dbRef(database, 'deleted');
    onValue(deletedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeletedOrders(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setDeletedOrders([]);
      }
    });

    // Listen for changes in the services node
    const servicesRef = dbRef(database, 'services');
    onValue(servicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setServices(data);
      } else {
        setServices({});
      }
    });

    // Listen for changes in the costs node
    const costsRef = dbRef(database, 'costs');
    onValue(costsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCosts(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setCosts([]);
      }
    });

    // Listen for changes in the admins node
    const adminsRef = dbRef(database, 'admins');
    onValue(adminsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAdmins(data);
      } else {
        setAdmins({});
      }
    });

  }, []);

  const updateOrderStatus = (orderId, status) => {
    if (status === 'Delivered') {
      // Move order to delivered orders
      const order = orders.find(o => o.id === orderId);
      if (order) {
        set(dbRef(database, `delivered/${orderId}`), { ...order, status });
        setOrders(orders.filter(o => o.id !== orderId));
        set(dbRef(database, `orders/${orderId}`), null); // Remove from orders
      }
    } else if (status === 'Deleted') {
      // Move order to deleted orders
      const order = orders.find(o => o.id === orderId);
      if (order) {
        set(dbRef(database, `deleted/${orderId}`), { ...order, status });
        setOrders(orders.filter(o => o.id !== orderId));
        set(dbRef(database, `orders/${orderId}`), null); // Remove from orders
      }
    } else {
      update(dbRef(database, `orders/${orderId}`), { status });
    }
  };

  const addService = async (serviceName, servicePrice, pricingType, imageUri) => {
    const newService = {
      name: serviceName,
      price: servicePrice,
      type: pricingType
    };

    const newServiceKey = `service_${Date.now()}`;
    if (imageUri) {
      const imageRef = storageRef(storage, `services/${newServiceKey}`);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      newService.imageUrl = await getDownloadURL(imageRef);
    }
    set(dbRef(database, `services/${newServiceKey}`), newService);
  };

  const addOrder = async (newOrder) => {
    const newOrderKey = `orders_${Date.now()}`;
    newOrder.services.map(async(service,index)=>{
      const imageUri = service.imageUri;
      const imageRef = storageRef(storage, `orders/${newOrderKey}/${index}`);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);
      delete service.imageUri;
      service.imageUrl = imageUrl;
      set(dbRef(database, `orders/${newOrderKey}/services/${index}`), service);
      return service;
    });
    set(dbRef(database, `orders/${newOrderKey}`), newOrder);
  };

  const updateService = async (serviceId, serviceData, hasImageChanged) => {
    if (hasImageChanged) {
      const imageRef = storageRef(storage, `services/${serviceId}`);
      const response = await fetch(serviceData.imageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      serviceData.imageUrl = await getDownloadURL(imageRef);
    }
    delete serviceData.imageUri;
    set(dbRef(database, `services/${serviceId}`), serviceData);
  };

  const removeService = (serviceId) => {
    if (services[serviceId].imageUrl) {
      const imageRef = storageRef(storage, `services/${serviceId}`);
      deleteObject(imageRef).catch((error) => {
        console.error('Failed to delete image:', error);
      });
    }
    set(dbRef(database, `services/${serviceId}`), null);
  };

  const addCost = async (cost) => {
    const newCostKey = `cost_${Date.now()}`;
    set(dbRef(database, `costs/${newCostKey}`), cost);
  };

  const addAdmin = async (expoPushToken, data) => {
console.log('registering' , data)
    set(dbRef(database, `admins/${expoPushToken}`), data);
  };

  return (
    <AppContext.Provider value={{ 
      orders, 
      addOrder, 
      deliveredOrders, 
      deletedOrders, 
      updateOrderStatus, 
      loading, 
      services, 
      addService, 
      updateService, 
      removeService, 
      costs, 
      addCost, 
      currency, 
      admins, 
      addAdmin 
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
  return useContext(AppContext);
};
