import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useAppContext } from '../context/AppContext';

const screenWidth = Dimensions.get('window').width;

const DeliveredOrdersPieChart = ({ timePeriod }) => {
  const { deliveredOrders, services } = useAppContext();

  const getLabelsAndData = (period) => {
    let totalRevenue = 0;
    const serviceRevenue = {};

    const currentDate = new Date();
    switch (period) {
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          const formattedDate = day.toISOString().slice(0, 10);
          const ordersForDay = deliveredOrders.filter(order => order.orderDate.startsWith(formattedDate));
          
          ordersForDay.forEach(order => {
            totalRevenue += calculateOrderRevenue(order, serviceRevenue);
          });
        }
        break;

      case 'month':
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
          const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
          const formattedDate = day.toISOString().slice(0, 10);
          const ordersForDay = deliveredOrders.filter(order => order.orderDate.startsWith(formattedDate));
          
          ordersForDay.forEach(order => {
            totalRevenue += calculateOrderRevenue(order, serviceRevenue);
          });
        }
        break;

      case 'trimester':
        const currentTrimesterMonth = Math.floor((currentDate.getMonth()) / 3) * 3;
        const startOfTrimester = new Date(currentDate.getFullYear(), currentTrimesterMonth, 1);
        const endOfTrimester = new Date(currentDate.getFullYear(), currentTrimesterMonth + 3, 0);

        let currentWeekStart = new Date(startOfTrimester);
        while (currentWeekStart <= endOfTrimester) {
          for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            const formattedDate = day.toISOString().slice(0, 10);
            const ordersForDay = deliveredOrders.filter(order => order.orderDate.startsWith(formattedDate));
            
            ordersForDay.forEach(order => {
              totalRevenue += calculateOrderRevenue(order, serviceRevenue);
            });
          }
          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }
        break;

      case 'year':
        for (let i = 0; i < 12; i++) {
          const month = new Date(currentDate.getFullYear(), i, 1);
          const formattedMonth = month.toISOString().slice(0, 7);
          const ordersForMonth = deliveredOrders.filter(order => order.orderDate.startsWith(formattedMonth));
          
          ordersForMonth.forEach(order => {
            totalRevenue += calculateOrderRevenue(order, serviceRevenue);
          });
        }
        break;

      default:
        break;
    }

    return { totalRevenue, serviceRevenue };
  };

  const calculateOrderRevenue = (order, serviceRevenue) => {
    return order.services.reduce((sum, order_service) => {
      const key = order_service.id;
      const service = services[key];
      const serviceTotal = service.type === 'perSquareMeter'
        ? Number(order_service.length) * Number(order_service.width) * Number(service.price)
        : Number(order_service.quantity) * Number(service.price);

      // Accumulate revenue by service
      if (!serviceRevenue[key]) {
        serviceRevenue[key] = { name: service.name, total: 0 };
      }
      serviceRevenue[key].total += serviceTotal;

      return sum + serviceTotal;
    }, 0);
  };

  const { totalRevenue, serviceRevenue } = getLabelsAndData(timePeriod);

  // Define a harmonious color palette
  const colorPalette = [
    "#4CAF50", // Green
    "#FF9800", // Orange
    "#F44336", // Red
    "#03A9F4", // Light Blue
    "#9C27B0", // Purple
    "#FFC107", // Amber
    "#009688", // Teal
    "#E91E63", // Pink
  ];

  const serviceData = Object.keys(serviceRevenue).map((key, index) => {
    const percentage = ((serviceRevenue[key].total / totalRevenue) * 100).toFixed(2);
    return {
      name: `${serviceRevenue[key].name} (${percentage}%)`,
      population: serviceRevenue[key].total,
      color: colorPalette[index % colorPalette.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    };
  });

  return (
   <><View style={styles.pieChartContainer}>
      <PieChart
        data={serviceData}
        width={screenWidth}
        height={220}
        chartConfig={{
          color: () => `#66cc66`,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        absolute={false} // Disable labels within the chart
        hasLegend={false}
        center={[screenWidth / 4, 0]} // Adjust center for donut effect
      />
      <Text style={[styles.centerTextContainer, styles.centerText]}>{totalRevenue}</Text>
      </View>
      <View style={styles.labelContainer}>
        {serviceData.map((service, index) => (
          <View key={index} style={styles.labelItem}>
            <View style={[styles.labelColorBox, { backgroundColor: service.color }]} />
            <Text style={styles.labelText}>{service.name}</Text>
          </View>
        ))}
      </View>
    </>
  );
};

const styles = {
  pieChartContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    textAlignVertical: 'center'
  },
  centerTextContainer: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 33,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5, // Add a subtle shadow for better readability
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    alignSelf: 'center',
    textAlign: 'center',
    textAlignVertical: 'center',
    width: 65, height: 65
  },
  centerText: {
    fontWeight: 'bold',
    color: '#333',
  },
  labelContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  labelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
    marginVertical: 2,
  },
  labelColorBox: {
    width: 12,
    height: 12,
    marginRight: 5,
    borderRadius: 3,
  },
  labelText: {
    fontSize: 12,
    color: '#333',
  },
};

export default DeliveredOrdersPieChart;
