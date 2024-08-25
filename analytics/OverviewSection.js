import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useAppContext } from '../context/AppContext';
import DeliveredOrdersChart from './DeliveredOrdersChart';
import DeletedOrdersChart from './DeletedOrdersChart';
import ExpensesChart from './ExpensesChart';
import ProfitChart from './ProfitChart';
import DeliveredOrdersPieChart from './DeliveredOrdersPieChart';
import ExpensesPieChart from './ExpensesPieChart';

const screenWidth = Dimensions.get('window').width;

const OverviewSection = () => {
  const { deliveredOrders, deletedOrders, costs, services, currency } = useAppContext();
  const [timePeriod, setTimePeriod] = useState('week'); // Default time period is 'This Week'
  const [selectedChart, setSelectedChart] = useState('delivered'); // Default chart is 'Delivered Orders'

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

  // Determine which chart to render based on user selection
  const renderSelectedChart = () => {
    switch (selectedChart) {
      case 'delivered':
        return <DeliveredOrdersChart timePeriod={timePeriod} />;
      case 'deleted':
        return <DeletedOrdersChart timePeriod={timePeriod} />;
      case 'expenses':
        return <ExpensesChart timePeriod={timePeriod} />;
      case 'profit':
        return <ProfitChart timePeriod={timePeriod} />;
      default:
        return <DeliveredOrdersChart timePeriod={timePeriod} />;
    }
  };

  const renderSelectedPieChart = () => {
    
        return <DeliveredOrdersPieChart timePeriod={timePeriod} />;
    
  };

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
          <View style={[styles.pickerWrapper, {width:'55%'}]}>
            <RNPickerSelect
              onValueChange={(value) => setSelectedChart(value)}
              items={[
                { label: 'Delivered Orders', value: 'delivered' },
                { label: 'Deleted Orders', value: 'deleted' },
                { label: 'Expenses', value: 'expenses' },
                { label: 'Profit', value: 'profit' },
              ]}
              style={pickerSelectStyles}
              value={selectedChart} // Default value is "Delivered Orders"
            />
          </View>
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

        {renderSelectedChart()}
        {renderSelectedPieChart()}
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    backgroundColor: 'lightgray',
    width: '40%'
  },
  chartPickers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
    alignContent: 'center',
    alignItems: 'center',
    marginBottom: 25
  }
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
