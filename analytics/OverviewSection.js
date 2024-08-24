import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useAppContext } from '../context/AppContext';
import { LineChart, PieChart } from 'react-native-chart-kit';
import RNPickerSelect from 'react-native-picker-select';

const screenWidth = Dimensions.get('window').width;

const OverviewSection = () => {
  const { deliveredOrders, deletedOrders, costs, services, currency } = useAppContext();
  const [timePeriod, setTimePeriod] = useState('week'); // Default time period is 'This Week'

  const today = new Date().toISOString().slice(0, 10); // Format YYYY-MM-DD

  // Calculate delivered orders for today
  const todayDeliveredOrders = deliveredOrders.filter(order => order.orderDate.startsWith(today));
  const todayDeletedOrders = deletedOrders.filter(order => order.orderDate.startsWith(today));
  
  // Calculate metrics for today's summary
  const numberOfDeliveredOrders = todayDeliveredOrders.length;
  const totalDeliveredRevenue = todayDeliveredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalDeletedRevenue = todayDeletedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalExpenses = costs.filter(cost => cost.date.startsWith(today)).reduce((sum, cost) => sum + Number(cost.price), 0);
  const netProfit = totalDeliveredRevenue - totalExpenses;
  const numberOfDeletedOrders = todayDeletedOrders.length;

  // Utility functions to get data labels and totals based on the selected time period
  const getLabelsAndData = (period) => {
    const labels = [];
    const data = [];
    let totalRevenue = 0;
    const serviceRevenue = {};

    const currentDate = new Date();
    switch (period) {
      case 'week':
        // Get the start of the current week (Sunday)
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          labels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
          const formattedDate = day.toISOString().slice(0, 10);
          const ordersForDay = deliveredOrders.filter(order => order.orderDate.startsWith(formattedDate));
          const dailyRevenue = ordersForDay.reduce((sum, order) => {
            return sum + calculateOrderRevenue(order, serviceRevenue);
          }, 0);
          data.push(dailyRevenue);
          totalRevenue += dailyRevenue;
        }
        break;

      case 'month':
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
          const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
          const weekNumber = Math.ceil(i / 7);
          labels.push(i % 7 === 0 || i === daysInMonth ? `Week ${weekNumber}` : ''); // Show "Week X" labels
          const formattedDate = day.toISOString().slice(0, 10);
          const ordersForDay = deliveredOrders.filter(order => order.orderDate.startsWith(formattedDate));
          const dailyRevenue = ordersForDay.reduce((sum, order) => {
            return sum + calculateOrderRevenue(order, serviceRevenue);
          }, 0);
          data.push(dailyRevenue);
          totalRevenue += dailyRevenue;
        }
        break;

      case 'trimester':
        const currentTrimesterMonth = Math.floor((currentDate.getMonth()) / 3) * 3;
        const startOfTrimester = new Date(currentDate.getFullYear(), currentTrimesterMonth, 1);
        const endOfTrimester = new Date(currentDate.getFullYear(), currentTrimesterMonth + 3, 0);

        let currentWeekStart = new Date(startOfTrimester);
        while (currentWeekStart <= endOfTrimester) {
          let weekSum = 0;
          const currentWeekEnd = new Date(currentWeekStart);
          currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

          for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            const formattedDate = day.toISOString().slice(0, 10);
            const ordersForDay = deliveredOrders.filter(order => order.orderDate.startsWith(formattedDate));
            weekSum += ordersForDay.reduce((sum, order) => {
              return sum + calculateOrderRevenue(order, serviceRevenue);
            }, 0);
          }

          data.push(weekSum);
          totalRevenue += weekSum;

          if (currentWeekStart.getDate() <= 7) {
            labels.push(currentWeekStart.toLocaleDateString('en-US', { month: 'short' }));
          } else {
            labels.push('');
          }

          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }
        break;

      case 'year':
        for (let i = 0; i < 12; i++) {
          const month = new Date(currentDate.getFullYear(), i, 1);
          const monthPlus = new Date(currentDate.getFullYear(), i + 1, 1);
          labels.push(month.toLocaleDateString('en-US', { month: 'short' }));
          const formattedMonth = monthPlus.toISOString().slice(0, 7);
          const ordersForMonth = deliveredOrders.filter(order => order.orderDate.startsWith(formattedMonth));
          const monthlyRevenue = ordersForMonth.reduce((sum, order) => {
            return sum + calculateOrderRevenue(order, serviceRevenue);
          }, 0);
          data.push(monthlyRevenue);
          totalRevenue += monthlyRevenue;
        }
        break;

      default:
        break;
    }

    return { labels, data, totalRevenue, serviceRevenue };
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

  const { labels, data, totalRevenue, serviceRevenue } = getLabelsAndData(timePeriod);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };


  const serviceData = Object.keys(serviceRevenue).map(key => {
    const percentage = ((serviceRevenue[key].total / totalRevenue) * 100).toFixed(2);
    return {
      name: `${serviceRevenue[key].name} (${percentage}%)`,
      population: serviceRevenue[key].total,
      color: getRandomColor(),
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    };
  });

  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.todaySummary}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>

        <View style={styles.summaryItem}>
          <Text style={styles.itemLabel}>Number of Delivered Orders:</Text>
          <Text style={styles.itemValue}>{numberOfDeliveredOrders}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.itemLabel}>Number of Deleted Orders:</Text>
          <Text style={styles.itemValue}>{numberOfDeletedOrders}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.itemLabel}>Canceled Orders:</Text>
          <Text style={[styles.itemValue, { color: 'gray' }]}>{totalDeletedRevenue} {currency}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.itemLabel}>Delivered Orders:</Text>
          <Text style={[styles.itemValue, { color: 'green' }]}>{totalDeliveredRevenue} {currency}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.itemLabel}>Total Expenses:</Text>
          <Text style={[styles.itemValue, { color: 'red' }]}>{totalExpenses} {currency}</Text>
        </View>

        <View style={styles.summaryItem}>
          <Text style={styles.itemLabel}>Profit:</Text>
          <Text style={[styles.itemValue, { color: netProfit > 0 ? 'green' : 'red' }]}>{netProfit} {currency}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartPickers}>
            <Text style={styles.chartTitle}>Delivered Orders</Text>
            <View style={styles.pickerWrapper}>
                <RNPickerSelect
                            onValueChange={(value) => setTimePeriod(value)}
                            items={[
                                { label: 'This Week', value: 'week' },
                                { label: 'This Month', value: 'month' },
                                { label: 'This Trimester', value: 'trimester' },
                                { label: 'This Year', value: 'year' },
                            ]}
                            style={pickerSelectStyles}
                            value={timePeriod} // Default value is "This Week"
                            />
            </View>
            
        </View>
        
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: data
              }
            ]
          }}
          width={screenWidth } // Adjusted width for better alignment
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0, // optional, defaults to 2dp
            color: () => `#66cc66`, // lighter green color
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: "0", // Extremely small dots
              strokeWidth: "1",
              stroke: "#66cc66", // Same color as the line
            },
            propsForLabels: {
              rotation: 0, // No rotation
              anchor: 'center',
            },
            propsForBackgroundLines: {
              stroke: 'none', // Remove grid lines
            },
            yAxisLabelWidth: 20, // Adjusted width for the y-axis labels
          }}
          bezier
          style={{
            borderRadius: 16,
            alignSelf: 'center', 
          }}
        />
      </View>

      <View style={styles.pieChartContainer}>
        {/* Segmented Donut Chart */}
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
        {/* Central Text for Grand Total */}
        
          <Text style={[styles.centerTextContainer,styles.centerText]}>{totalRevenue}</Text>
          </View>
        {/* Labels at the Bottom */}
        <View style={styles.labelContainer}>
          {serviceData.map((service, index) => (
            <View key={index} style={styles.labelItem}>
              <View style={[styles.labelColorBox, { backgroundColor: service.color }]} />
              <Text style={styles.labelText}>{service.name}</Text>
            </View>
          ))}
        </View>
      
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  todaySummary: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemLabel: {
    fontSize: 16,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chartContainer: {
    marginTop: 20,
    borderRadius: 8,
    flex: 1,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    backgroundColor: 'lightgray',
    width:'40%'
  },
  chartPickers:{
    flexDirection:'row',
    justifyContent:'space-between',
    flex:1,
    alignContent:'center',
    alignItems:'center',
    marginBottom:25
  },
  pieChartContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    position: 'relative',
    alignItems: 'center',
    justifyContent:'center',
    textAlign:'center',
    textAlignVertical:'center'
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
    alignSelf:'center', textAlign:'center',
    textAlignVertical:'center',
    width:65,height:65
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
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 5, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 5, // to ensure the text is never behind the icon
  },
};

export default OverviewSection;
