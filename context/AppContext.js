import React, { createContext, useState, useEffect, useContext } from 'react';
import { database } from '../services/firebaseConfig';
import { ref, onValue, update, set } from 'firebase/database';

// Create the context
const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [deletedOrders, setDeletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for changes in the orders node
    const ordersRef = ref(database, 'orders');
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
    const deliveredRef = ref(database, 'delivered');
    onValue(deliveredRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeliveredOrders(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setDeliveredOrders([]);
      }
    });

    // Listen for changes in the deleted node
    const deletedRef = ref(database, 'deleted');
    onValue(deletedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeletedOrders(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setDeletedOrders([]);
      }
    });
  }, []);

  const updateOrderStatus = (orderId, status) => {
    if (status === 'Delivered') {
      // Move order to delivered orders
      const order = orders.find(o => o.id === orderId);
      if (order) {
        set(ref(database, `delivered/${orderId}`), { ...order, status });
        setOrders(orders.filter(o => o.id !== orderId));
        set(ref(database, `orders/${orderId}`), null); // Remove from orders
      }
    } else {
      update(ref(database, `orders/${orderId}`), { status });
    }
  };

  const addDeleted = (order) => {
    return new Promise((resolve, reject) => {
      set(ref(database, `deleted/${order.id}`), { ...order, status: 'Deleted' })
        .then(() => {
          setOrders(orders.filter(o => o.id !== order.id));
          set(ref(database, `orders/${order.id}`), null); // Remove from orders
          resolve();
        })
        .catch(reject);
    });
  };

  const addOrder = (order) => {
    return new Promise((resolve, reject) => {
      set(ref(database, `orders/${order.id}`), order)
        .then(resolve)
        .catch(reject);
    });
  };

  const updateOrder = (order) => {
    return new Promise((resolve, reject) => {
      update(ref(database, `orders/${order.id}`), order)
        .then(resolve)
        .catch(reject);
    });
  };

  return (
    <AppContext.Provider value={{ orders, deliveredOrders, deletedOrders, updateOrderStatus, addDeleted, addOrder, updateOrder, loading }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
  return useContext(AppContext);
};
