/* eslint-disable prettier/prettier */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function AdminDashboard({ navigation }) {
    const handleLogout = async () => {
        try {
            navigation.replace('SignIn'); // Navigate to your login screen
        } catch (error) {
            console.error('Failed to logout: ', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Button
                mode="contained"
                onPress={() => navigation.navigate('AssignRemoveClass')}
                style={styles.button}
            >
                Assign/Remove Class to Teacher
            </Button>
            <Button
                mode="contained"
                onPress={() => navigation.navigate('StudentManagement')}
                style={styles.button}
            >
                Student Management
            </Button>
            <Button
                mode="contained"
                onPress={() => navigation.navigate('FeeStatusManagement')}
                style={styles.button}
            >
                Fee Status Management
            </Button>
            <Button
                mode="contained"
                onPress={() => navigation.navigate('ViewReports')}
                style={styles.button}
            >
                View Reports
            </Button>
            <Button
                mode="contained"
                onPress={() => navigation.navigate('UploadRemoveTimetable')}
                style={styles.button}
            >
                Upload/Remove Timetable
            </Button>
            <Button
                mode="contained"
                onPress={() => navigation.navigate('UploadRemoveSyllabus')}
                style={styles.button}
            >
                Upload/Remove Syllabus
            </Button>
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
    button: {
        marginVertical: 10,
        backgroundColor: '#446cb4',
    },
    logoutbutton: {
        marginVertical: 10,
        backgroundColor: '#ff4237',
    },
});
