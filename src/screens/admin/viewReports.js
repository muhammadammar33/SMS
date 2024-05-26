/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from 'react-native';
import { Button, DataTable } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

export default function ViewReports() {
    const [reportType, setReportType] = useState(null);
    const [students, setStudents] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalBoys, setTotalBoys] = useState(0);
    const [totalGirls, setTotalGirls] = useState(0);

    useEffect(() => {
        const fetchStudents = async () => {
            const studentList = [];
            const snapshot = await firestore().collection('students').get();
            let boysCount = 0;
            let girlsCount = 0;
            snapshot.forEach(doc => {
                const student = { id: doc.id, ...doc.data() };
                student.age = calculateAge(student.dateOfBirth);
                studentList.push(student);
                if (student.gender === 'Male') {
                    boysCount += 1;
                } else if (student.gender === 'Female') {
                    girlsCount += 1;
                }
            });
            setStudents(studentList);
            setTotalBoys(boysCount);
            setTotalGirls(girlsCount);
            setLoading(false);
        };

        fetchStudents();
    }, []);

    // useEffect(() => {
    //     const fetchResults = async () => {
    //         const resultList = [];
    //         const snapshot = await firestore().collection('results').get();
    //         snapshot.forEach(doc => {
    //             resultList.push({ id: doc.id, ...doc.data() });
    //         });
    //         setResults(resultList);
    //         setLoading(false);
    //     };

    //     if (reportType === 'ResultSheet') {
    //         fetchResults();
    //     }
    // }, [reportType]);

    const calculateAge = (dateOfBirth) => {
        const now = new Date();
        const birthDate = dateOfBirth.toDate();
        let years = now.getFullYear() - birthDate.getFullYear();
        let months = now.getMonth() - birthDate.getMonth();

        if (months < 0) {
            years -= 1;
            months += 12;
        }

        return `${years} years, ${months} months`;
    };

    const formatDate = (date) => {
        const d = date.toDate();
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    };

    const renderStudentAgeRecord = () => (
        <View style={styles.tableContainer}>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Reg. No.</DataTable.Title>
                    <DataTable.Title>Name</DataTable.Title>
                    <DataTable.Title>Father Name</DataTable.Title>
                    <DataTable.Title>Date of Birth</DataTable.Title>
                    <DataTable.Title>Age</DataTable.Title>
                </DataTable.Header>
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <DataTable.Row>
                            <DataTable.Cell>{item.registrationNumber}</DataTable.Cell>
                            <DataTable.Cell>{item.name}</DataTable.Cell>
                            <DataTable.Cell>{item.fatherName}</DataTable.Cell>
                            <DataTable.Cell>{formatDate(item.dateOfBirth)}</DataTable.Cell>
                            <DataTable.Cell>{item.age}</DataTable.Cell>
                        </DataTable.Row>
                    )}
                />
            </DataTable>
            <Text>Total Boys: {totalBoys}</Text>
            <Text>Total Girls: {totalGirls}</Text>
        </View>
    );

    // const renderResultSheet = () => (
    //     <View style={styles.tableContainer}>
    //         <DataTable>
    //             <DataTable.Header>
    //                 <DataTable.Title>Student Name</DataTable.Title>
    //                 <DataTable.Title>Class</DataTable.Title>
    //                 <DataTable.Title>Result</DataTable.Title>
    //                 <DataTable.Title>Marks</DataTable.Title>
    //             </DataTable.Header>
    //             <FlatList
    //                 data={results}
    //                 keyExtractor={(item) => item.id}
    //                 renderItem={({ item }) => (
    //                     <DataTable.Row>
    //                         <DataTable.Cell>{item.studentName}</DataTable.Cell>
    //                         <DataTable.Cell>{item.className}</DataTable.Cell>
    //                         <DataTable.Cell>{item.result}</DataTable.Cell>
    //                         <DataTable.Cell>{item.marks}</DataTable.Cell>
    //                     </DataTable.Row>
    //                 )}
    //             />
    //         </DataTable>
    //     </View>
    // );

    // if (loading) {
    //     return <ActivityIndicator size="large" style={styles.loading} />;
    // }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>View Reports</Text>
            <Button mode="contained" onPress={() => setReportType('StudentAgeRecord')} style={styles.button}>
                Student Age Record
            </Button>
            <Button mode="contained" onPress={() => setReportType('ResultSheet')} style={styles.button}>
                Result Sheet
            </Button>
            {reportType === 'StudentAgeRecord' && renderStudentAgeRecord()}
            {/* {reportType === 'ResultSheet' && renderResultSheet()} */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#446cb4',
    },
    tableContainer: {
        marginTop: 20,
    },
});
