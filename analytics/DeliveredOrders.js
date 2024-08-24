import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Linking } from 'react-native';
import { useAppContext } from '../context/AppContext';
// import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const DeliveredOrders = ({ startDate, endDate }) => {
    const { deliveredOrders, currency, services, loading } = useAppContext();
    const [totalFilteredOrders, setTotalFilteredOrders] = useState(0);
    const [filteredOrders, setFilteredOrders] = useState([]);

    useEffect(() => {
        const filtered = filterOrdersByDate(deliveredOrders);
        const total = filtered.reduce((sum, order) => sum + order.total, 0);
        setTotalFilteredOrders(total);
        setFilteredOrders(filtered);
    }, [startDate, endDate, deliveredOrders]);

    const filterOrdersByDate = (orders) => {
        return orders.filter((order) => {
            const orderDate = new Date(order.orderDate);
            return orderDate >= startDate && orderDate <= endDate;
        });
    };

    const renderServicesTable = (order_services) => {
        const detailedServices = order_services.map((order_service, index) => {
            const key = order_service.id;
            const service = services[key];
            const total = service.type === 'perSquareMeter'
                ? Number(order_service.length) * Number(order_service.width) * Number(service.price)
                : Number(order_service.quantity) * Number(service.price);

            return (
                <View key={`${index} _${key}`} style={styles.serviceRow}>
                    <Text style={styles.serviceCell}>{service.name}</Text>
                    <Text style={styles.serviceCell}>
                        {service.type === 'perSquareMeter'
                            ? `${order_service.length} x ${order_service.width} m²`
                            : `${order_service.quantity} Pcs`}
                    </Text>
                    <Text style={styles.serviceCell}>{total.toFixed(0)} {currency}</Text>
                </View>
            );
        });

        return <View>{detailedServices}</View>;
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return `${date.toLocaleDateString()}`;
    };

    const generateChartData = () => {
        const dates = filteredOrders.map(order => formatDateTime(order.orderDate));
        const uniqueDates = [...new Set(dates)];

        const data = uniqueDates.map(date => ({
            date,
            count: filteredOrders.filter(order => formatDateTime(order.orderDate) === date).length,
        }));

        return {
            labels: data.map(d => d.date),
            datasets: [
                {
                    data: data.map(d => d.count),
                    color: () => `rgba(50, 205, 50, 1)`, // Green line
                    strokeWidth: 2,
                },
            ],
        };
    };

    const generateTotalChartData = () => {
        const dates = filteredOrders.map(order => formatDateTime(order.orderDate));
        const uniqueDates = [...new Set(dates)];

        const data = uniqueDates.map(date => ({
            date,
            total: filteredOrders
                .filter(order => formatDateTime(order.orderDate) === date)
                .reduce((sum, order) => sum + order.total, 0),
        }));

        return {
            labels: data.map(d => d.date),
            datasets: [
                {
                    data: data.map(d => d.total),
                    color: () => `rgba(50, 205, 50, 1)`, // Green line
                    strokeWidth: 2,
                },
            ],
        };
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    const chartData = generateChartData();
    const totalChartData = generateTotalChartData();

    return (
        <View style={styles.container}>
            <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Delivered Orders</Text>
                <View style={{flexDirection:'column'}}>
                    <Text style={styles.totalText}>{totalFilteredOrders} {currency}</Text>
                    <Text style={styles.totalText}>{filteredOrders.length} Orders</Text>
                </View>
            </View>

            {/* {filteredOrders.length > 0 && (
                <>
                    <LineChart
                        data={chartData}
                        width={width * 0.95} // from react-native
                        height={220}
                        yAxisLabel=""
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0, // optional, defaults to 2dp
                            color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                            propsForDots: {
                                r: '6',
                                strokeWidth: '2',
                                stroke: '#32cd32',
                            },
                            fillShadowGradient: `rgba(50, 205, 50, 0.3)`,
                            fillShadowGradientOpacity: 0.3,
                        }}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                    />
                    <LineChart
                        data={totalChartData}
                        width={width * 0.95} // from react-native
                        height={220}
                        yAxisLabel={`${currency} `}
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0, // optional, defaults to 2dp
                            color: (opacity = 1) => `rgba(50, 205, 50, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                            propsForDots: {
                                r: '6',
                                strokeWidth: '2',
                                stroke: '#32cd32',
                            },
                            fillShadowGradient: `rgba(50, 205, 50, 0.3)`,
                            fillShadowGradientOpacity: 0.3,
                        }}
                        bezier
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                        }}
                    />
                </>
            )} */}

            <ScrollView style={styles.scrollView}>
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((item, index) => (
                        <View key={`Delivered_${index}/${item.id}`} style={styles.details}>
                            <View style={styles.row}>
                                <Text style={styles.label}>Full Name:</Text>
                                <Text style={styles.value}>{item.name}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Phone:</Text>
                                <Text onPress={() => Linking.openURL(`tel:${item.phone}`)}  style={[styles.value, styles.link]}>
                                    {item.phone}
                                </Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Location:</Text>
                                <Text style={styles.value}>{item.location}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Order Date:</Text>
                                <Text style={styles.value}>{formatDateTime(item.orderDate)}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Services:</Text>
                            </View>
                            <View style={styles.serviceTable}>
                                {renderServicesTable(item.services)}
                                <Text style={styles.totalLabel}>{item.total} {currency}</Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noOrdersText}>No Delivered orders between those dates</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#32cd32',
    },
    scrollView: {
        width: '100%',
    },
    details: {
        backgroundColor: '#f2f2f2',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    label: {
        fontWeight: 'bold',
        width: '40%',
        textAlign: 'left',
    },
    value: {
        width: '60%',
        textAlign: 'left',
    },
    noOrdersText: {
        fontSize: 16,
        color: 'gray',
        textAlign: 'center',
        marginTop: 20,
    },
    serviceTable: {
        flex: 1,
        marginBottom: 15,
    },
    serviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    serviceCell: {
        width: '33%',
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 16,
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
});

export default DeliveredOrders;
