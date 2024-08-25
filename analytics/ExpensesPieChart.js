import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useAppContext } from '../context/AppContext';

const screenWidth = Dimensions.get('window').width;

const ExpensesPieChart = ({ timePeriod }) => {
  const { costs } = useAppContext();

  const getLabelsAndData = (period) => {
    let totalExpenses = 0;
    const expenseCategories = {};

    const currentDate = new Date();
    switch (period) {
      case 'week':
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          const formattedDate = day.toISOString().slice(0, 10);
          const expensesForDay = costs.filter(cost => cost.date.startsWith(formattedDate));
          expensesForDay.forEach(expense => {
            totalExpenses += calculateExpense(expense, expenseCategories);
          });
        }
        break;

      case 'month':
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
          const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
          const formattedDate = day.toISOString().slice(0, 10);
          const expensesForDay = costs.filter(cost => cost.date.startsWith(formattedDate));
          expensesForDay.forEach(expense => {
            totalExpenses += calculateExpense(expense, expenseCategories);
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
            const expensesForDay = costs.filter(cost => cost.date.startsWith(formattedDate));
            expensesForDay.forEach(expense => {
              totalExpenses += calculateExpense(expense, expenseCategories);
            });
          }
          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }
        break;

      case 'year':
        for (let i = 0; i < 12; i++) {
          const month = new Date(currentDate.getFullYear(), i, 1);
          const formattedMonth = month.toISOString().slice(0, 7);
          const expensesForMonth = costs.filter(cost => cost.date.startsWith(formattedMonth));
          expensesForMonth.forEach(expense => {
            totalExpenses += calculateExpense(expense, expenseCategories);
          });
        }
        break;

      default:
        break;
    }

    return { totalExpenses, expenseCategories };
  };

  const calculateExpense = (expense, expenseCategories) => {
    const category = expense.category || 'Other'; // Assuming each expense has a category
    const expenseTotal = Number(expense.price);

    if (!expenseCategories[category]) {
      expenseCategories[category] = { name: category, total: 0 };
    }
    expenseCategories[category].total += expenseTotal;

    return expenseTotal;
  };

  const { totalExpenses, expenseCategories } = getLabelsAndData(timePeriod);

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const expenseData = Object.keys(expenseCategories).map(key => {
    const percentage = ((expenseCategories[key].total / totalExpenses) * 100).toFixed(2);
    return {
      name: `${expenseCategories[key].name} (${percentage}%)`,
      population: expenseCategories[key].total,
      color: getRandomColor(),
      legendFontColor: "#7F7F7F",
      legendFontSize: 12
    };
  });

  return (
    <><View style={styles.pieChartContainer}>
      <PieChart
        data={expenseData}
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
      <Text style={[styles.centerTextContainer, styles.centerText]}>{totalExpenses}</Text>
      </View>
      <View style={styles.labelContainer}>
        {expenseData.map((expense, index) => (
          <View key={index} style={styles.labelItem}>
            <View style={[styles.labelColorBox, { backgroundColor: expense.color }]} />
            <Text style={styles.labelText}>{expense.name}</Text>
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

export default ExpensesPieChart;
