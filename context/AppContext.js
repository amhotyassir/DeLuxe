import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);

  const addCustomer = (customer) => {
    setCustomers([...customers, customer]);
  };

  const addOrder = (order) => {
    setOrders([...orders, order]);
  };

  const addService = (service) => {
    setServices([...services, service]);
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        addCustomer,
        orders,
        addOrder,
        services,
        addService,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  else{
    console.log(con)
  }
  return context;
};
