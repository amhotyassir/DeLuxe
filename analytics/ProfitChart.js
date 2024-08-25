import React from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAppContext } from '../context/AppContext';

const screenWidth = Dimensions.get('window').width;

const ProfitChart = ({ timePeriod }) => {
  const { deliveredOrders, costs, services } = useAppContext();

  const getLabelsAndData = (period) => {
    const labels = [];
    const data = [];

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
          const expensesForDay = costs.filter(cost => cost.date.startsWith(formattedDate));

          let dailyRevenue = 0;
          let dailyExpenses = 0;

          ordersForDay.forEach(order => {
            dailyRevenue += calculateOrderRevenue(order);
          });
          expensesForDay.forEach(expense => {
            dailyExpenses += Number(expense.price);
          });

          const dailyProfit = dailyRevenue - dailyExpenses;
          data.push(dailyProfit);
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
          const expensesForDay = costs.filter(cost => cost.date.startsWith(formattedDate));

          let dailyRevenue = 0;
          let dailyExpenses = 0;

          ordersForDay.forEach(order => {
            dailyRevenue += calculateOrderRevenue(order);
          });
          expensesForDay.forEach(expense => {
            dailyExpenses += Number(expense.price);
          });

          const dailyProfit = dailyRevenue - dailyExpenses;
          data.push(dailyProfit);
        }
        break;

      case 'trimester':
        const currentTrimesterMonth = Math.floor((currentDate.getMonth()) / 3) * 3;
        const startOfTrimester = new Date(currentDate.getFullYear(), currentTrimesterMonth, 1);
        const endOfTrimester = new Date(currentDate.getFullYear(), currentTrimesterMonth + 3, 0);

        let currentWeekStart = new Date(startOfTrimester);
        while (currentWeekStart <= endOfTrimester) {
          let weekProfit = 0;

          for (let i = 0; i < 7; i++) {
            const day = new Date(currentWeekStart);
            day.setDate(currentWeekStart.getDate() + i);
            const formattedDate = day.toISOString().slice(0, 10);
            const ordersForDay = deliveredOrders.filter(order => order.orderDate.startsWith(formattedDate));
            const expensesForDay = costs.filter(cost => cost.date.startsWith(formattedDate));

            let dailyRevenue = 0;
            let dailyExpenses = 0;

            ordersForDay.forEach(order => {
              dailyRevenue += calculateOrderRevenue(order);
            });
            expensesForDay.forEach(expense => {
              dailyExpenses += Number(expense.price);
            });

            weekProfit += dailyRevenue - dailyExpenses;
          }

          data.push(weekProfit);

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
          const formattedMonth = month.toISOString().slice(0, 7);
          const ordersForMonth = deliveredOrders.filter(order => order.orderDate.startsWith(formattedMonth));
          const expensesForMonth = costs.filter(cost => cost.date.startsWith(formattedMonth));

          let monthlyRevenue = 0;
          let monthlyExpenses = 0;

          ordersForMonth.forEach(order => {
            monthlyRevenue += calculateOrderRevenue(order);
          });
          expensesForMonth.forEach(expense => {
            monthlyExpenses += Number(expense.price);
          });

          const monthlyProfit = monthlyRevenue - monthlyExpenses;
          data.push(monthlyProfit);
          labels.push(month.toLocaleDateString('en-US', { month: 'short' }));
        }
        break;

      default:
        break;
    }

    return { labels, data };
  };

  const calculateOrderRevenue = (order) => {
    return order.services.reduce((sum, order_service) => {
      const key = order_service.id;
      const service = services[key];
      const serviceTotal = service.type === 'perSquareMeter'
        ? Number(order_service.length) * Number(order_service.width) * Number(service.price)
        : Number(order_service.quantity) * Number(service.price);
      return sum + serviceTotal;
    }, 0);
  };

  const { labels, data } = getLabelsAndData(timePeriod);

  const chartColor = data.every(profit => profit >= 0) ? '#66cc66' : '#cc6666'; // Green if all profits are positive, else red

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
        yAxisLabel=""
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: () => chartColor,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "0",
            strokeWidth: "1",
            stroke: chartColor,
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

export default ProfitChart;
