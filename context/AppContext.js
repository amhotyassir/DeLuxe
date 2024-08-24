import React, { createContext, useState, useEffect, useContext } from 'react';
import { database } from '../services/firebaseConfig';
import { ref as dbRef, onValue, set, remove, update } from 'firebase/database';

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
  const [admins, setAdmins] = useState({});

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

  const updateOrderStatus = async (orderId, status) => {
    if (status === 'Delivered') {
      // Move order to delivered orders
      const order = orders.find(o => o.id === orderId);

      if (order) {
        await set(dbRef(database, `delivered/${orderId}`), { ...order, status });
        setDeliveredOrders([...deliveredOrders, order])
        setOrders(orders.filter(o => o.id !== orderId));
        await remove(dbRef(database, `orders/${orderId}`)); // Remove from orders
      }
    } else if (status === 'Deleted') {
      // Move order to deleted orders
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await set(dbRef(database, `deleted/${orderId}`), { ...order, status });
        setDeletedOrders([...deletedOrders, order])
        setOrders(orders.filter(o => o.id !== orderId));
        await remove(dbRef(database, `orders/${orderId}`)); // Remove from orders
      }
    } else {
      await update(dbRef(database, `orders/${orderId}`), { status });
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
    await set(dbRef(database, `services/${newServiceKey}`), newService);
    setServices({...services, [newServiceKey]: newService})
  };

  const addOrder = async (newOrder) => {
    const newOrderKey = `orders_${Date.now()}`;
    newOrder.services.map(async (service, index) => {
      const imageUri = service.imageUri;
      const imageRef = storageRef(storage, `orders/${newOrderKey}/${index}`);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      const imageUrl = await getDownloadURL(imageRef);
      delete service.imageUri;
      service.imageUrl = imageUrl;
      await set(dbRef(database, `orders/${newOrderKey}/services/${index}`), service);
      return service;
    });
    await set(dbRef(database, `orders/${newOrderKey}`), newOrder);
    setOrders([...orders, {id: newOrderKey, ...newOrder}])
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
    await set(dbRef(database, `services/${serviceId}`), serviceData);
    setServices({...services,[serviceId]: serviceData})
  };

  const removeService = async (serviceId) => {
    if (services[serviceId].imageUrl) {
      const imageRef = storageRef(storage, `services/${serviceId}`);
      await deleteObject(imageRef).catch((error) => {
        console.error('Failed to delete image:', error);
      });
    }
    
    await remove(dbRef(database, `services/${serviceId}`));
    setServices((prev)=>{
      delete prev.serviceId
      return prev
    })
  };

  const addCost = async (cost) => {
    const newCostKey = `cost_${Date.now()}`;

    await set(dbRef(database, `costs/${newCostKey}`), cost);
    setCosts((prevCosts) => [...prevCosts, { id: newCostKey, ...cost }]);

  };

  const deleteCost = async (costId) => {
    await remove(dbRef(database, `costs/${costId}`));
    setCosts((prevCosts)=> {
      delete prevCosts.costId
      return prevCosts
    })
  };

  const addAdmin = async (adminId, adminData) => {
    await set(dbRef(database, `admins/${adminId}`), adminData);
    setAdmins((prev) => [...prev, { id: adminId, ...adminData }]);

  };

  return (
    <AppContext.Provider value={{
      orders, addOrder, deliveredOrders, deletedOrders, updateOrderStatus, loading, services,
      addService, updateService, removeService, costs, addCost, deleteCost, currency, admins, addAdmin
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
  return useContext(AppContext);
};
