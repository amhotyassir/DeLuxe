import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import OverviewSection from '../analytics/OverviewSection';
import ExpensesSection from '../analytics/ExpensesSection';
import DeliveredOrders from '../analytics/DeliveredOrders';
import DeletedOrders from '../analytics/DeletedOrders';

const { width, height } = Dimensions.get('window');

// Helper functions to set time to 00:00:00 and 23:59:59
const setStartOfDay = (date) => {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
};

const setEndOfDay = (date) => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
};

const AnalyticsScreen = ({ initialStartDate = new Date(), initialEndDate = new Date() }) => {
    // Setting start and end date with time adjustments
    const [startDate, setStartDate] = useState(setStartOfDay(initialStartDate));
    const [endDate, setEndDate] = useState(setEndOfDay(initialEndDate));
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const handleStartDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || startDate;
        setShowStartPicker(false);
        setStartDate(setStartOfDay(currentDate));
    };

    const handleEndDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || endDate;
        setShowEndPicker(false);
        setEndDate(setEndOfDay(currentDate));
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {/* <OverviewSection /> */}
                <Text style={styles.title}>Audit</Text>
                <View style={styles.datePickerContainer}>
                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowStartPicker(true)}
                    >
                        <Ionicons name="calendar" size={20} color="white" />
                        <Text style={styles.datePickerText}>
                            Start Date: {startDate.toLocaleDateString('en-GB')}
                        </Text>
                    </TouchableOpacity>
                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={handleStartDateChange}
                        />
                    )}

                    <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowEndPicker(true)}
                    >
                        <Ionicons name="calendar" size={20} color="white" />
                        <Text style={styles.datePickerText}>
                            End Date: {endDate.toLocaleDateString('en-GB')}
                        </Text>
                    </TouchableOpacity>
                    {showEndPicker && (
                        <DateTimePicker
                            value={endDate}
                            mode="date"
                            display="default"
                            onChange={handleEndDateChange}
                        />
                    )}
                </View>
                <ExpensesSection startDate={startDate} endDate={endDate} />
                <DeliveredOrders startDate={startDate} endDate={endDate} />
                <DeletedOrders startDate={startDate} endDate={endDate} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 16,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign:'center',
        marginBottom: 15
    },
    datePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'gray',
        borderRadius: 8,
        padding: 10,
        width: width * 0.4,
    },
    datePickerText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
    },
    scrollView: {
        width: '100%',
        marginBottom: 40,
    },
});

export default AnalyticsScreen;
