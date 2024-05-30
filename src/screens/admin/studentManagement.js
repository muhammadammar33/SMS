/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { Button, Text, TextInput, RadioButton, ActivityIndicator } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import DatePicker from 'react-native-date-picker';

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    // const [date, setDate] = useState(new Date());

    // Form Fields
    const [formFields, setFormFields] = useState({
        registrationNumber: '',
        dateOfAdmission: '',
        name: '',
        dateOfBirth: '',
        age: '',
        gender: '',
        fatherName: '',
        caste: '',
        occupation: '',
        residence: '',
        admissionClass: '',
        password: '',
        remarks: '',
    });

    useEffect(() => {
        // Fetch students
        const fetchStudents = async () => {
            const studentList = [];
            const snapshot = await firestore().collection('students').get();
            snapshot.forEach(doc => {
                studentList.push({ id: doc.id, ...doc.data() });
            });
            setStudents(studentList);
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
        fetchClasses();

        fetchStudents();
        setLoading(false);
    }, []);

    const addStudent = async () => {
        try {
            const studentRef = await firestore().collection('students').add(formFields);
            if (selectedClass) {
                const classRef = firestore().collection('classes').doc(selectedClass);
                const classDoc = await classRef.get();
                if (classDoc.exists) {
                    const { studentAssigned = [] } = classDoc.data();
                    if (!studentAssigned.includes(studentRef.id)) {
                        await classRef.update({
                            studentAssigned: firestore.FieldValue.arrayUnion(studentRef.id),
                        });
                        Alert.alert('Success', 'Student added and assigned to class successfully');
                    } else {
                        Alert.alert('Success', 'Student added successfully');
                    }
                }
            }
            clearForm();
            setModalVisible(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to add student');
        }
    };

    const updateStudent = async () => {
        try {
            await firestore().collection('students').doc(selectedStudent.id).update(formFields);

            if (selectedClass) {
                const classRef = firestore().collection('classes').doc(selectedClass);
                const classDoc = await classRef.get();

                if (classDoc.exists) {
                    const { studentAssigned = [] } = classDoc.data();
                    if (!studentAssigned.includes(selectedStudent.id)) {
                        await classRef.update({
                            studentAssigned: firestore.FieldValue.arrayUnion(selectedStudent.id),
                        });
                        Alert.alert('Success', 'Student updated and assigned to class successfully');
                    } else {
                        Alert.alert('Success', 'Student updated successfully');
                    }
                }
            } else {
                Alert.alert('Success', 'Student updated successfully');
            }

            setSelectedStudent(null);
            clearForm();
            setModalVisible(false);
            setIsEdit(false);
        } catch (error) {
            Alert.alert('Error', 'Failed to update student');
        }
    };

    const deleteStudent = async (id) => {
        try {
            const studentRef = firestore().collection('students').doc(id);
            const studentDoc = await studentRef.get();

            if (studentDoc.exists) {
                const { admissionClass } = studentDoc.data();

                if (admissionClass) {
                    const classQuerySnapshot = await firestore()
                        .collection('classes')
                        .where('name', '==', admissionClass)
                        .get();

                    if (!classQuerySnapshot.empty) {
                        const classDoc = classQuerySnapshot.docs[0];
                        const classRef = classDoc.ref;
                        const { studentAssigned = [] } = classDoc.data();

                        if (studentAssigned.includes(id)) {
                            await classRef.update({
                                studentAssigned: firestore.FieldValue.arrayRemove(id),
                            });
                        }
                    }
                }

                await studentRef.delete();
                Alert.alert('Success', 'Student deleted successfully');
            } else {
                Alert.alert('Error', 'Student does not exist');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to delete student');
        }
    };


    const handleStudentPress = (student) => {
        setSelectedStudent(student);
        setFormFields(student);
        setIsEdit(true);
        setModalVisible(true);
    };

    const clearForm = () => {
        setFormFields({
            registrationNumber: '',
            dateOfAdmission: '',
            name: '',
            dateOfBirth: '',
            gender: '',
            fatherName: '',
            caste: '',
            occupation: '',
            residence: '',
            admissionClass: '',
            password: '',
            remarks: '',
        });
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Student Management</Text>
            <Button
                mode="contained"
                onPress={() => {
                    clearForm();
                    setIsEdit(false);
                    setModalVisible(true);
                }}
                style={styles.button}
            >
                Add Student
            </Button>
            <FlatList
                data={students}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => handleStudentPress(item)}
                    >
                        <Text style={styles.itemText}>{item.name}</Text>
                        <Text style={styles.itemText}>{item.registrationNumber}</Text>
                        <Text style={styles.itemText}>{item.admissionClass}</Text>
                        <Button
                            mode="contained"
                            onPress={() => deleteStudent(item.id)}
                            style={styles.deleteButton}
                        >
                            Delete
                        </Button>
                    </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
            />
            <Modal
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <ScrollView>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{isEdit ? 'Update Student' : 'Add Student'}</Text>
                    <TextInput
                        label="Registration Number"
                        value={formFields.registrationNumber}
                        onChangeText={(text) => setFormFields({ ...formFields, registrationNumber: text })}
                        style={styles.input}
                        keyboardType="numeric"
                    />
                    {/* <DatePicker mode="date" date={date} onDateChange={setDate} /> */}
                    <TextInput
                        label="Admission Date"
                        value={formFields.dateOfAdmission}
                        onChangeText={(text) => setFormFields({ ...formFields, dateOfAdmission: text })}
                        style={styles.input}
                    />
                    <TextInput
                        label="Name"
                        value={formFields.name}
                        onChangeText={(text) => setFormFields({ ...formFields, name: text })}
                        style={styles.input}
                    />
                    <TextInput
                        label="Date of Birth"
                        value={formFields.dateOfBirth}
                        onChangeText={(text) => setFormFields({ ...formFields, dateOfBirth: text })}
                        style={styles.input}
                    />
                    <Text style={styles.gendertitle}>Gender</Text>
                    <RadioButton.Group onValueChange={value => setFormFields({ ...formFields, gender: value })} value={formFields.gender}>
                        <View style={styles.radioButtonContainer}>
                            <RadioButton.Item label="Male" value="Male" />
                            <RadioButton.Item label="Female" value="Female" />
                        </View>
                    </RadioButton.Group>
                    <TextInput
                        label="Father Name"
                        value={formFields.fatherName}
                        onChangeText={(text) => setFormFields({ ...formFields, fatherName: text })}
                        style={styles.input}
                    />
                    <TextInput
                        label="Caste"
                        value={formFields.caste}
                        onChangeText={(text) => setFormFields({ ...formFields, caste: text })}
                        style={styles.input}
                    />
                    <TextInput
                        label="Occupation"
                        value={formFields.occupation}
                        onChangeText={(text) => setFormFields({ ...formFields, occupation: text })}
                        style={styles.input}
                    />
                    <TextInput
                        label="Residence"
                        value={formFields.residence}
                        onChangeText={(text) => setFormFields({ ...formFields, residence: text })}
                        style={styles.input}
                    />
                    <Text style={styles.subtitle}>Select Class:</Text>
                    <FlatList
                        data={classes}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.item, selectedClass === item.id && styles.selectedItem]}
                                onPress={() => {
                                    setFormFields({ ...formFields, admissionClass: item.name });
                                    setSelectedClass(item.id);
                                }}
                            >
                                <Text style={styles.itemText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={item => item.id}
                    />
                    <TextInput
                        label="Password"
                        value={formFields.password}
                        onChangeText={(text) => setFormFields({ ...formFields, password: text })}
                        style={styles.input}
                    />
                    <TextInput
                        label="Remarks"
                        value={formFields.remarks}
                        onChangeText={(text) => setFormFields({ ...formFields, remarks: text })}
                        style={styles.input}
                    />
                    <Button onPress={() => { setModalVisible(false); clearForm(); }}>Cancel</Button>
                    <Button onPress={isEdit ? updateStudent : addStudent} style={styles.button}>
                        {isEdit ? 'Update' : 'Add'}
                    </Button>
                </View>
                </ScrollView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
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
    button: {
        marginVertical: 10,
        backgroundColor: '#446cb4',
    },
    subtitle: {
        fontSize: 18,
        marginVertical: 10,
        color: '#446cb4',
    },
    selectedItem: {
        backgroundColor: '#cce5ff',
    },
    item: {
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemText: {
        fontSize: 16,
    },
    deleteButton: {
        backgroundColor: '#d9534f',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        marginBottom: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
    },
    radioButtonContainer: {
        flexDirection: 'row',
    },
    gendertitle: {
        marginLeft: -250,
        fontSize: 20,
        fontWeight: 'bold',
    },
});
