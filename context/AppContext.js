import React, { createContext, useState, useEffect, useContext } from 'react';
import { database } from '../services/firebaseConfig';
import { ref, onValue, set, remove } from 'firebase/database';

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
    if (status === 'Delivered' || status === 'Deleted') {
      // Move order to delivered or deleted orders
      const order = orders.find(o => o.id === orderId);
      if (order) {
        if (status === 'Delivered') {
          set(ref(database, `delivered/${orderId}`), { ...order, status });
        } else {
          set(ref(database, `deleted/${orderId}`), { ...order, status });
        }
        setOrders(orders.filter(o => o.id !== orderId));
        remove(ref(database, `orders/${orderId}`)); // Remove from orders
      }
    } else {
      set(ref(database, `orders/${orderId}`), { ...orders.find(o => o.id === orderId), status });
    }
  };

  const addOrder = (newOrder) => {
    const newOrderId = `order_${Date.now()}`;
    return set(ref(database, `orders/${newOrderId}`), { ...newOrder, id: newOrderId });
  };

  const addDeleted = (order) => {
    return set(ref(database, `deleted/${order.id}`), { ...order, status: 'Deleted' })
      .then(() => remove(ref(database, `orders/${order.id}`))); // Remove from orders
  };

  return (
    <AppContext.Provider value={{ orders, deliveredOrders, deletedOrders, updateOrderStatus, addOrder, addDeleted, loading }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the AppContext
export const useAppContext = () => {
  return useContext(AppContext);
};
