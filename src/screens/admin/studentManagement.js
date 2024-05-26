/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { Button, Text, TextInput, RadioButton, ActivityIndicator } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

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

        fetchStudents();
        setLoading(false);
    }, []);

    const addStudent = async () => {
        try {
            await firestore().collection('students').add(formFields);
            clearForm();
            setModalVisible(false);
            Alert.alert('Success', 'Student added successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to add student');
        }
    };

    const updateStudent = async () => {
        try {
            await firestore().collection('students').doc(selectedStudent.id).update(formFields);
            setSelectedStudent(null);
            clearForm();
            setModalVisible(false);
            setIsEdit(false);
            Alert.alert('Success', 'Student updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update student');
        }
    };

    const deleteStudent = async (id) => {
        try {
            await firestore().collection('students').doc(id).delete();
            Alert.alert('Success', 'Student deleted successfully');
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
                    <TextInput
                        label="Admission Class"
                        value={formFields.admissionClass}
                        onChangeText={(text) => setFormFields({ ...formFields, admissionClass: text })}
                        style={styles.input}
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
    button: {
        marginVertical: 10,
        backgroundColor: '#446cb4',
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
