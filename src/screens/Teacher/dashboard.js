/* eslint-disable prettier/prettier */
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Alert, View, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button, DataTable, ActivityIndicator, TextInput, RadioButton } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

export default function TeacherDashboard({ route, navigation }) {
    const { teacher } = route.params;
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [newMark, setNewMark] = useState('');
    const [newExam, setNewExam] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const handleLogout = async () => {
        try {
            navigation.replace('SignIn'); // Navigate to your login screen
        } catch (error) {
            console.error('Failed to logout: ', error);
        }
    };

    useEffect(() => {
        const fetchStudentsAndMarks = async () => {
            try {
                // Fetch classes and students
                const fetchClassesAndStudents = async () => {
                    const classList = [];
                    const studentList = [];

                    const classSnapshot = await firestore().collection('classes').where('teacherAssigned', 'array-contains', teacher.id).get();

                    for (const classDoc of classSnapshot.docs) {
                        const classData = { id: classDoc.id, ...classDoc.data() };
                        const studentDetails = [];

                        for (const studentId of classData.studentAssigned || []) {
                            const studentSnapshot = await firestore().collection('students').doc(studentId).get();
                            if (studentSnapshot.exists) {
                                const studentData = { id: studentSnapshot.id, ...studentSnapshot.data() };
                                studentDetails.push(studentData);
                                studentList.push(studentData);
                            }
                        }
                        classData.students = studentDetails;
                        classList.push(classData);
                    }

                    setClasses(classList);
                    setStudents(studentList);
                    setLoading(false);

                    // Debugging output
                    console.log('Class List:', classList);
                    console.log('Student List:', studentList);
                };

                fetchClassesAndStudents();

                // Fetch marks
                const marksList = [];
                const marksSnapshot = await firestore()
                    .collection('marks')
                    .where('subjectTeacher', '==', teacher.name)
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

        fetchStudentsAndMarks();
    }, [teacher]);

    const handleAddMark = async () => {
        if (selectedStudent && newExam && newMark) {
            try {
                const newMarkDoc = await firestore().collection('marks').add({
                    studentId: selectedStudent.id,
                    subject: teacher.subject,
                    exam: newExam,
                    marks: newMark,
                    subjectTeacher: teacher.name,
                });
                setMarks([...marks, { id: newMarkDoc.id, studentId: selectedStudent.id, exam: newExam, marks: newMark }]);
                setNewMark('');
                setNewExam('');
                setSelectedStudent(null);
            } catch (error) {
                Alert.alert('Error', 'Something went wrong.');
            }
        } else {
            Alert.alert('Incomplete Data', 'Please fill all fields.');
        }
    };

    const handleUpdateMark = async (markId, updatedMarks) => {
        try {
            await firestore().collection('marks').doc(markId).update({ marks: updatedMarks });
            setMarks(marks.map(mark => (mark.id === markId ? { ...mark, marks: updatedMarks } : mark)));
        } catch (error) {
            Alert.alert('Error', 'Something went wrong.');
        }
    };

    const handleDeleteMark = async (markId) => {
        try {
            await firestore().collection('marks').doc(markId).delete();
            setMarks(marks.filter(mark => mark.id !== markId));
        } catch (error) {
            Alert.alert('Error', 'Something went wrong.');
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loading} />;
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Welcome, {teacher.name}</Text>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Student</DataTable.Title>
                    <DataTable.Title>Exam</DataTable.Title>
                    <DataTable.Title>Marks</DataTable.Title>
                    <DataTable.Title>Actions</DataTable.Title>
                </DataTable.Header>
                {marks.map(mark => (
                    <DataTable.Row key={mark.id}>
                        <DataTable.Cell>{students.find(student => student.id === mark.studentId)?.name || 'Unknown'}</DataTable.Cell>
                        <DataTable.Cell>{mark.exam}</DataTable.Cell>
                        <DataTable.Cell>
                            <TextInput
                                value={mark.marks}
                                onChangeText={text => handleUpdateMark(mark.id, text)}
                                mode="outlined"
                                keyboardType="numeric"
                                style={styles.input}
                            />
                        </DataTable.Cell>
                        <DataTable.Cell>
                            <Button mode="contained" onPress={() => handleDeleteMark(mark.id)}>Del</Button>
                        </DataTable.Cell>
                    </DataTable.Row>
                ))}
            </DataTable>
            <Text style={styles.subtitle}>Add New Marks</Text>
            <TextInput
                label="Student"
                value={selectedStudent?.name || ''}
                mode="outlined"
                style={styles.input}
                onFocus={() => setModalVisible(true)}
                editable={true}
            />
            <Text style={styles.gendertitle}>Select Term</Text>
            <RadioButton.Group onValueChange={value => setNewExam(value)} value={newExam}>
                <View style={styles.radioButtonContainer}>
                    <RadioButton.Item label="First" value="First" />
                    <RadioButton.Item label="Mid" value="Mid" />
                    <RadioButton.Item label="Final" value="Final" />
                </View>
            </RadioButton.Group>
            <TextInput
                label="Marks"
                value={newMark}
                onChangeText={text => setNewMark(text)}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
            />
            <Button
                mode="contained"
                onPress={handleAddMark}
                style={styles.button}
                disabled={!selectedStudent || !newExam || !newMark}
            >
                Add Marks
            </Button>

            <Button
                mode="contained"
                onPress={handleLogout}
                style={styles.logoutbutton}
            >
                Logout
            </Button>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>Select Student</Text>
                        <FlatList
                            data={students}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => {
                                        setSelectedStudent(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={styles.itemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Button
                            mode="contained"
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                        >
                            Close
                        </Button>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingHorizontal: 20,
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
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
        color: '#446cb4',
    },
    button: {
        marginVertical: 10,
        backgroundColor: '#446cb4',
    },
    input: {
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    item: {
        padding: 15,
        backgroundColor: '#f8f8f8',
        marginBottom: 10,
        borderRadius: 5,
    },
    itemText: {
        fontSize: 18,
    },
    closeButton: {
        marginTop: 10,
    },
    radioButtonContainer: {
        flexDirection: 'row',
    },
    gendertitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    logoutbutton: {
        marginVertical: 10,
        backgroundColor: '#ff4237',
    },
});
