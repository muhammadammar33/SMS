/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, Text } from 'react-native';
import { Button, TextInput, RadioButton, ActivityIndicator } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [formFields, setFormFields] = useState({
        registrationNumber: '',
        dateOfAdmission: new Date(),
        name: '',
        dateOfBirth: new Date(),
        gender: '',
        fatherName: '',
        caste: '',
        occupation: '',
        residence: '',
        admissionClass: '',
        password: '',
        remarks: '',
    });
    const [showAdmissionDatePicker, setShowAdmissionDatePicker] = useState(false);
    const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);

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
        setFormFields({ ...student, dateOfAdmission: student.dateOfAdmission.toDate(), dateOfBirth: student.dateOfBirth.toDate() });
        setIsEdit(true);
        setModalVisible(true);
    };

    const clearForm = () => {
        setFormFields({
            registrationNumber: '',
            dateOfAdmission: new Date(),
            name: '',
            dateOfBirth: new Date(),
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

    const handleDateChange = (event, selectedDate, field) => {
        const currentDate = selectedDate || formFields[field];
        setFormFields({ ...formFields, [field]: currentDate });
        if (field === 'dateOfAdmission') {
            setShowAdmissionDatePicker(false);
        } else if (field === 'dateOfBirth') {
            setShowBirthDatePicker(false);
        }
    };

    const formFieldsArray = [
        { key: 'registrationNumber', label: 'Registration Number', keyboardType: 'numeric' },
        { key: 'dateOfAdmission', label: 'Admission Date', type: 'date' },
        { key: 'name', label: 'Name' },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
        { key: 'gender', label: 'Gender', type: 'radio' },
        { key: 'fatherName', label: 'Father Name' },
        { key: 'caste', label: 'Caste' },
        { key: 'occupation', label: 'Occupation' },
        { key: 'residence', label: 'Residence' },
        { key: 'admissionClass', label: 'Select Class', type: 'class' },
        { key: 'password', label: 'Password' },
        { key: 'remarks', label: 'Remarks' },
    ];

    const renderFormItem = ({ item }) => {
        switch (item.type) {
            case 'date':
                return (
                    <TouchableOpacity onPress={() => (item.key === 'dateOfAdmission' ? setShowAdmissionDatePicker(true) : setShowBirthDatePicker(true))}>
                        <TextInput
                            label={item.label}
                            value={formFields[item.key].toDateString()}
                            style={styles.input}
                            editable={false}
                        />
                        {item.key === 'dateOfAdmission' && showAdmissionDatePicker && (
                            <DateTimePicker
                                value={formFields.dateOfAdmission}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'dateOfAdmission')}
                            />
                        )}
                        {item.key === 'dateOfBirth' && showBirthDatePicker && (
                            <DateTimePicker
                                value={formFields.dateOfBirth}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'dateOfBirth')}
                            />
                        )}
                    </TouchableOpacity>
                );
            case 'radio':
                return (
                    <>
                        <Text style={styles.gendertitle}>{item.label}</Text>
                        <RadioButton.Group onValueChange={(value) => setFormFields({ ...formFields, gender: value })} value={formFields.gender}>
                            <View style={styles.radioButtonContainer}>
                                <RadioButton.Item label="Male" value="Male" />
                                <RadioButton.Item label="Female" value="Female" />
                            </View>
                        </RadioButton.Group>
                    </>
                );
            case 'class':
                return (
                    <>
                        <Text style={styles.subtitle}>{item.label}:</Text>
                        <FlatList
                            data={classes}
                            renderItem={({ item: classItem }) => (
                                <TouchableOpacity
                                    style={[styles.item, selectedClass === classItem.id && styles.selectedItem]}
                                    onPress={() => {
                                        setFormFields({ ...formFields, admissionClass: classItem.name });
                                        setSelectedClass(classItem.id);
                                    }}
                                >
                                    <Text style={styles.itemText}>{classItem.name}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(classItem) => classItem.id}
                        />
                    </>
                );
            default:
                return (
                    <TextInput
                        label={item.label}
                        value={formFields[item.key]}
                        onChangeText={(text) => setFormFields({ ...formFields, [item.key]: text })}
                        style={styles.input}
                        keyboardType={item.keyboardType}
                    />
                );
        }
    };

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#446cb4" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Student Management</Text>
            <FlatList
                data={students}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.item} onPress={() => handleStudentPress(item)}>
                        <Text style={styles.itemText}>{item.name}</Text>
                        <Text style={styles.itemText}>{item.registrationNumber}</Text>
                        <Text style={styles.itemText}>{item.admissionClass}</Text>
                        <Button onPress={() => deleteStudent(item.id)} style={styles.deleteButton}>
                            Delete
                        </Button>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
            />
            <Button onPress={() => setModalVisible(true)} style={styles.button}>
                Add Student
            </Button>
            <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{isEdit ? 'Edit Student' : 'Add Student'}</Text>
                    <FlatList
                        data={formFieldsArray}
                        renderItem={renderFormItem}
                        keyExtractor={(item) => item.key}
                    />
                    <Button onPress={() => { setModalVisible(false); clearForm(); }}>Cancel</Button>
                    <Button onPress={isEdit ? updateStudent : addStudent} style={styles.button}>
                        {isEdit ? 'Update' : 'Add'}
                    </Button>
                </View>
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
        fontSize: 20,
        fontWeight: 'bold',
    },
});
