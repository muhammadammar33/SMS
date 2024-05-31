/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, Alert } from 'react-native';
import { Button, DataTable } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

export default function ViewReports() {
    const [reportType, setReportType] = useState(null);
    const [students, setStudents] = useState([]);
    // const [results, setResults] = useState([]);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalBoys, setTotalBoys] = useState(0);
    const [totalGirls, setTotalGirls] = useState(0);
    const [studentAgeData, setStudentAgeData] = useState([]);

    useEffect(() => {
        const fetchAgeReports = async () => {
            try {
                const studentsSnapshot = await firestore().collection('students').get();

                const studentAgeData = studentsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    const dob = data.dateOfBirth.toDate();
                    const age = calculateAge(dob);
                    return {
                        id: doc.id,
                        studentName: data.name,
                        dateOfBirth: dob.toLocaleDateString(),
                        age: `${age.years} years, ${age.months} months`,
                        gender: data.gender,
                    };
                });
                setStudentAgeData(studentAgeData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching reports: ', error);
            }
        };

        fetchAgeReports();
    }, []);

    // useEffect(() => {
    //     const fetchStudents = async () => {
    //         const studentList = [];
    //         const snapshot = await firestore().collection('students').get();
    //         let boysCount = 0;
    //         let girlsCount = 0;
    //         snapshot.forEach(doc => {
    //             const student = { id: doc.id, ...doc.data() };
    //             student.age = calculateAge(student.dateOfBirth);
    //             studentList.push(student);
    //             if (student.gender === 'Male') {
    //                 boysCount += 1;
    //             } else if (student.gender === 'Female') {
    //                 girlsCount += 1;
    //             }
    //         });
    //         setStudents(studentList);
    //         setTotalBoys(boysCount);
    //         setTotalGirls(girlsCount);
    //         setLoading(false);
    //     };

    //     fetchStudents();
    // }, []);

    useEffect(() => {
        const fetchStudents = async () => {
            const studentList = [];
            const snapshot = await firestore().collection('students').get();
            snapshot.forEach(doc => {
                studentList.push({ id: doc.id, ...doc.data() });
            });
            setStudents(studentList);
            setLoading(false);
        };

        fetchStudents();
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                // Fetch marks
                const marksList = [];
                const marksSnapshot = await firestore()
                    .collection('marks')
                    .get();
                marksSnapshot.forEach(doc => {
                    marksList.push({ id: doc.id, ...doc.data() });
                });
                setMarks(marksList);

                setLoading(false);
            } catch (error) {
                Alert.alert('Error', 'Something went wrong.');
            }
        };

        fetchResults();
    }, [reportType]);

    // const calculateAge = (dateOfBirth) => {
    //     const now = new Date();
    //     const birthDate = dateOfBirth.toDate();
    //     let years = now.getFullYear() - birthDate.getFullYear();
    //     let months = now.getMonth() - birthDate.getMonth();

    //     if (months < 0) {
    //         years -= 1;
    //         months += 12;
    //     }

    //     return `${years} years, ${months} months`;
    // };

    const calculateAge = (dob) => {
        const now = new Date();
        const diff = now - dob;
        const ageDate = new Date(diff);
        const years = ageDate.getUTCFullYear() - 1970;
        const months = ageDate.getUTCMonth();
        return { years, months };
    };

    // const formatDate = (date) => {
    //     const d = date.toDate();
    //     return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    // };

    // const renderStudentAgeRecord = () => (
    //     <View style={styles.tableContainer}>
    //         <DataTable>
    //             <DataTable.Header>
    //                 <DataTable.Title>Reg. No.</DataTable.Title>
    //                 <DataTable.Title>Name</DataTable.Title>
    //                 <DataTable.Title>Father Name</DataTable.Title>
    //                 <DataTable.Title>Date of Birth</DataTable.Title>
    //                 <DataTable.Title>Age</DataTable.Title>
    //             </DataTable.Header>
    //             <FlatList
    //                 data={students}
    //                 keyExtractor={(item) => item.id}
    //                 renderItem={({ item }) => (
    //                     <DataTable.Row>
    //                         <DataTable.Cell>{item.registrationNumber}</DataTable.Cell>
    //                         <DataTable.Cell>{item.name}</DataTable.Cell>
    //                         <DataTable.Cell>{item.fatherName}</DataTable.Cell>
    //                         <DataTable.Cell>{formatDate(item.dateOfBirth)}</DataTable.Cell>
    //                         <DataTable.Cell>{item.age}</DataTable.Cell>
    //                     </DataTable.Row>
    //                 )}
    //             />
    //         </DataTable>
    //         <Text>Total Boys: {totalBoys}</Text>
    //         <Text>Total Girls: {totalGirls}</Text>
    //     </View>
    // );

    const renderStudentAgeRecord = () => (
        <View>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Name</DataTable.Title>
                    <DataTable.Title>Date of Birth</DataTable.Title>
                    <DataTable.Title>Age</DataTable.Title>
                </DataTable.Header>
                {studentAgeData.map(student => (
                    <DataTable.Row key={student.id}>
                        <DataTable.Cell>{student.studentName}</DataTable.Cell>
                        <DataTable.Cell>{student.dateOfBirth}</DataTable.Cell>
                        <DataTable.Cell>{student.age}</DataTable.Cell>
                    </DataTable.Row>
                ))}
            </DataTable>
            <Text>Total Boys: {studentAgeData.filter(s => s.gender === 'Male').length}</Text>
            <Text>Total Girls: {studentAgeData.filter(s => s.gender === 'Female').length}</Text>
        </View>
    );

    const renderResultSheet = () => (
        <View>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Student</DataTable.Title>
                    <DataTable.Title>Exam</DataTable.Title>
                    <DataTable.Title>Marks</DataTable.Title>
                </DataTable.Header>
                {marks.map(mark => (
                    <DataTable.Row key={mark.id}>
                        <DataTable.Cell>{students.find(student => student.id === mark.studentId)?.name || 'Unknown'}</DataTable.Cell>
                        <DataTable.Cell>{mark.exam}</DataTable.Cell>
                        <DataTable.Cell>{mark.marks}</DataTable.Cell>
                    </DataTable.Row>
                ))}
            </DataTable>
        </View>
    );

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
            {reportType === 'ResultSheet' && renderResultSheet()}
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
