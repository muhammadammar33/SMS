/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

const StudentDashboard = ({ route, navigation }) => {
    const { student } = route.params;
    const [marks, setMarks] = useState([]);
    const [feeStatus, setFeeStatus] = useState([]);
    const [timetableUrl, setTimetableUrl] = useState(null);
    const [syllabusUrl, setSyllabusUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = async () => {
        try {
            navigation.replace('SignIn'); // Navigate to your login screen
        } catch (error) {
            console.error('Failed to logout: ', error);
        }
    };

    useEffect(() => {
        const fetchMarks = async () => {
            const marksData = await firestore().collection('marks').where('studentId', '==', student.id).get();
            setMarks(marksData.docs.map(doc => doc.data()));
        };

        const fetchFeeStatus = async () => {
            const feeData = await firestore().collection('feeStatuses').where('studentName', '==', student.name).get();
            setFeeStatus(feeData.docs.map(doc => doc.data()));
        };

        const fetchTimetable = async () => {
            const timetableDoc = await firestore().collection('timetable').doc('current').get();
            if (timetableDoc.exists) {
                setTimetableUrl(timetableDoc.data().url);
            }
        };

        const fetchSyllabus = async () => {
            const syllabusQuery = await firestore().collection('classes').where('name', '==', student.admissionClass).get();
            if (!syllabusQuery.empty) {
                syllabusQuery.forEach(doc => {
                    setSyllabusUrl(doc.data().url);
                });
            }
        };

        const fetchData = async () => {
            await fetchMarks();
            await fetchFeeStatus();
            await fetchTimetable();
            await fetchSyllabus();
            setLoading(false);
        };

        fetchData();
    }, [student]);

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loading} />;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Welcome, {student.name}</Text>

            <View style={styles.section}>
                <Text style={styles.subheading}>Marks</Text>
                {marks.map((mark, index) => (
                    <Text key={index}>{mark.subject}: {mark.marks} ({mark.exam} term)</Text>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subheading}>Fee Status</Text>
                {feeStatus.map((fee, index) => (
                    <View key={index}>
                        <Text>Remaining Fee: {fee.payableAmount} ({fee.paidAmount} / {fee.feeAmount })</Text>
                        <Text>Due Date: {fee.paymentDate}</Text>
                        <Text>{fee.payableAmount > 0 ? 'UnPaid' : 'Paid'}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.subheading}>Timetable</Text>
                {timetableUrl ? (
                    <Image source={{ uri: timetableUrl }} style={styles.image} />
                ) : (
                    <Text>Loading...</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.subheading}>Syllabus</Text>
                {syllabusUrl ? (
                    <Image source={{ uri: syllabusUrl }} style={styles.image} />
                ) : (
                    <Text>Loading...</Text>
                )}
            </View>
            <Button
                mode="contained"
                onPress={handleLogout}
                style={styles.logoutbutton}
            >
                Logout
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
        // marginVertical: 30,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#446cb4',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    section: {
        marginBottom: 24,
    },
    subheading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: 300,
        marginBottom: 20,
    },
    logoutbutton: {
        marginVertical: 10,
        backgroundColor: '#ff4237',
    },
});

export default StudentDashboard;
