/* eslint-disable prettier/prettier */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';

export default function StudentDashboard({ route, navigation }) {
    const { student } = route.params;

    const handleLogout = async () => {
        try {
            navigation.replace('SignIn'); // Navigate to your login screen
        } catch (error) {
            console.error('Failed to logout: ', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {student.name}</Text>
            {/* Add more student-specific information and functionalities here */}
            <Button
                mode="contained"
                onPress={handleLogout}
                style={styles.logoutbutton}
            >
                Logout
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#446cb4',
    },
});
