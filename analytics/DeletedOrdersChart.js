import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAppContext } from '../context/AppContext';

const screenWidth = Dimensions.get('window').width;

const DeletedOrdersChart = ({ timePeriod }) => {
  const { deletedOrders } = useAppContext();

  const getLabelsAndData = (period) => {
    const labels = [];
    const data = [];

    const currentDate = new Date();
    switch (period) {
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          labels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
          const formattedDate = day.toISOString().slice(0, 10);
          const ordersForDay = deletedOrders.filter(order => order.orderDate.startsWith(formattedDate));
          const dailyRevenue = ordersForDay.reduce((sum, order) => sum + order.total, 0);
          data.push(dailyRevenue);
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
          const ordersForDay = deletedOrders.filter(order => order.orderDate.startsWith(formattedDate));
          const dailyRevenue = ordersForDay.reduce((sum, order) => sum + order.total, 0);
          data.push(dailyRevenue);
        }
        break;

      case 'trimester':
        const currentTrimesterMonth = Math.floor((currentDate.getMonth()) / 3) * 3;
        const startOfTrimester = new Date(currentDate.getFullYear(), currentTrimesterMonth, 1);
        const endOfTrimester = new Date(currentDate.getFullYear(), currentTrimesterMonth + 3, 0);

        let currentWeekStart = new Date(startOfTrimester);
        while (currentWeekStart <= endOfTrimester) {
          let weekSum = 0;

          for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            const formattedDate = day.toISOString().slice(0, 10);
            const ordersForDay = deletedOrders.filter(order => order.orderDate.startsWith(formattedDate));
            weekSum += ordersForDay.reduce((sum, order) => sum + order.total, 0);
          }

          data.push(weekSum);
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
          labels.push(month.toLocaleDateString('en-US', { month: 'short' }));
          const formattedMonth = month.toISOString().slice(0, 7);
          const ordersForMonth = deletedOrders.filter(order => order.orderDate.startsWith(formattedMonth));
          const monthlyRevenue = ordersForMonth.reduce((sum, order) => sum + order.total, 0);
          data.push(monthlyRevenue);
        }
        break;

      default:
        break;
    }

    return { labels, data };
  };

  const { labels, data } = getLabelsAndData(timePeriod);

  return (
    <View>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: data
            }
          ]
        }}
        width={screenWidth}
        height={220}
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: () => `#FF6666`, // lighter red color for deleted orders
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "0",
            strokeWidth: "1",
            stroke: "#FF6666", // Same color as the line
          },
          propsForLabels: {
            rotation: 0,
            anchor: 'center',
          },
          propsForBackgroundLines: {
            stroke: 'none',
          },
          yAxisLabelWidth: 20,
        }}
        bezier
        style={{
          borderRadius: 16,
          alignSelf: 'center',
        }}
      />
    </View>
  );
};

export default DeletedOrdersChart;
