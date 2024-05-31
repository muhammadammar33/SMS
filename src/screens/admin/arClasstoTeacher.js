/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Button, Text } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

export default function AssignRemoveClass() {
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch teachers
        const fetchTeachers = async () => {
            const teacherList = [];
            const snapshot = await firestore().collection('teachers').get();
            snapshot.forEach(doc => {
                teacherList.push({ id: doc.id, ...doc.data() });
            });
            setTeachers(teacherList);
            setLoading(false);
        };

        // Fetch classes
        const fetchClasses = async () => {
            const classList = [];
            const snapshot = await firestore().collection('classes').get();
            snapshot.forEach(doc => {
                classList.push({ id: doc.id, ...doc.data() });
            });
            setClasses(classList);
            setLoading(false);
        };

        fetchTeachers();
        fetchClasses();
    }, []);

    const assignClass = async () => {
        if (selectedTeacher && selectedClass) {
            const teacherRef = firestore().collection('teachers').doc(selectedTeacher);
            const teacherDoc = await teacherRef.get();

            if (teacherDoc.exists) {
                const { classAssigned = [] } = teacherDoc.data();
                if (!classAssigned.includes(selectedClass)) {
                    await teacherRef.update({
                        classAssigned: firestore.FieldValue.arrayUnion(selectedClass),
                    });
                    Alert.alert('Success', 'Class assigned successfully');
                } else {
                    Alert.alert('Error', 'Class is already assigned to this teacher');
                }
            }
            const classRef = firestore().collection('classes').doc(selectedClass);
            const classDoc = await classRef.get();

            if (classDoc.exists) {
                const { teacherAssigned = [] } = classDoc.data();
                if (!teacherAssigned.includes(selectedTeacher)) {
                    await classRef.update({
                        teacherAssigned: firestore.FieldValue.arrayUnion(selectedTeacher),
                    });
                    Alert.alert('Success', 'Class assigned successfully');
                } else {
                    Alert.alert('Error', 'Class is already assigned to this teacher');
                }
            }
        } else {
            Alert.alert('Error', 'Please select both teacher and class');
        }
    };

    const removeClass = async () => {
        if (selectedTeacher && selectedClass) {
            const teacherRef = firestore().collection('teachers').doc(selectedTeacher);
            const teacherDoc = await teacherRef.get();

            if (teacherDoc.exists) {
                const { classAssigned = [] } = teacherDoc.data();
                if (classAssigned.includes(selectedClass)) {
                    await teacherRef.update({
                        classAssigned: firestore.FieldValue.arrayRemove(selectedClass),
                    });
                    Alert.alert('Success', 'Class removed successfully');
                } else {
                    Alert.alert('Error', 'Class is not assigned to this teacher');
                }
            }
            const classRef = firestore().collection('classes').doc(selectedClass);
            const classDoc = await classRef.get();

            if (classDoc.exists) {
                const { teacherAssigned = [] } = classDoc.data();
                if (teacherAssigned.includes(selectedTeacher)) {
                    await classRef.update({
                        teacherAssigned: firestore.FieldValue.arrayRemove(selectedTeacher),
                    });
                    Alert.alert('Success', 'Class removed successfully');
                } else {
                    Alert.alert('Error', 'Class is not assigned to this teacher');
                }
            }
        } else {
            Alert.alert('Error', 'Please select both teacher and class');
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Assign/Remove Class</Text>
            <Text style={styles.subtitle}>Select Teacher:</Text>
            <FlatList
                data={teachers}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.item, selectedTeacher === item.id && styles.selectedItem]}
                        onPress={() => setSelectedTeacher(item.id)}
                    >
                        <Text style={styles.itemText}>{item.name} ({item.subject})</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
            />
            <Text style={styles.subtitle}>Select Class:</Text>
            <FlatList
                data={classes}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.item, selectedClass === item.id && styles.selectedItem]}
                        onPress={() => setSelectedClass(item.id)}
                    >
                        <Text style={styles.itemText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
            />
            <Button
                mode="contained"
                onPress={assignClass}
                style={styles.button}
            >
                Assign Class
            </Button>
            <Button
                mode="contained"
                onPress={removeClass}
                style={styles.button}
            >
                Remove Class
            </Button>
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
        color: '#446cb4',
    },
    subtitle: {
        fontSize: 18,
        marginVertical: 10,
        color: '#446cb4',
    },
    item: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
    },
    selectedItem: {
        backgroundColor: '#cce5ff',
    },
    itemText: {
        fontSize: 16,
    },
    button: {
        marginVertical: 10,
        backgroundColor: '#446cb4',
    },
});
