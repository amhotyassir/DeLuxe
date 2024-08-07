import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider } from './context/AppContext';
import OrderEntryScreen from './screens/OrderEntryScreen';
import OrderListScreen from './screens/OrderListScreen';
import ServiceManagementScreen from './screens/ServiceManagementScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

function App () {
  return (
    <AppProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === 'OrderEntry') {
                iconName = 'add-circle';
              } else if (route.name === 'OrderList') {
                iconName = 'list';
              } else if (route.name === 'ServiceManagement') {
                iconName = 'settings';
              } else if (route.name === 'Settings') {
                iconName = 'options';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            activeTintColor: 'tomato',
            inactiveTintColor: 'gray',
            tabBarStyle: [
              {
                "display": "flex"
              },
              null
            ]
          }}
        >
          <Tab.Screen name="OrderEntry" component={OrderEntryScreen} />
          <Tab.Screen name="OrderList" component={OrderListScreen} />
          <Tab.Screen name="ServiceManagement" component={ServiceManagementScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
};

export default App
