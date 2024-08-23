import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const OverviewSection = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('thisDay');

    const periods = [
        { label: 'This Day', value: 'thisDay' },
        { label: 'This Week', value: 'thisWeek' },
        { label: 'This Month', value: 'thisMonth' },
        { label: 'This Year', value: 'thisYear' },
    ];

    const generateChartData = () => {
        // Example data generation based on selectedPeriod
        const data = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    data: [50, 100, 150, 200, 250, 300, 350],
                    color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`, // green
                    strokeWidth: 2,
                },
            ],
        };

        return data;
    };

    const chartData = generateChartData();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Overview</Text>
            <RNPickerSelect
                onValueChange={(value) => setSelectedPeriod(value)}
                items={periods}
                style={pickerSelectStyles}
                value={selectedPeriod}
                placeholder={{ label: "Select a period", value: null }}
            />
            <LineChart
                data={chartData}
                width={width * 0.9}
                height={220}
                yAxisLabel=""
                chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                    propsForDots: {
                        r: '6',
                        strokeWidth: '2',
                        stroke: '#00ff00',
                    },
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 4,
        color: 'black',
        paddingRight: 30,
        marginBottom: 16,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 8,
        color: 'black',
        paddingRight: 30,
        marginBottom: 16,
    },
});

export default OverviewSection;
