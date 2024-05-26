/* eslint-disable prettier/prettier */
/* eslint-disable no-shadow */
/* eslint-disable react/no-unstable-nested-components */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Modal, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Button, Text, TextInput, List, RadioButton } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

export default function FeeStatusManagement() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feeStatuses, setFeeStatuses] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [studentId, setStudentId] = useState('');
    const [studentName, setStudentName] = useState('');
    const [feeAmount, setFeeAmount] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [payableAmount, setPayableAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [lateFeeStatus, setLateFeeStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedFeeStatus, setSelectedFeeStatus] = useState(null);
    const [studentModalVisible, setStudentModalVisible] = useState(false);

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
    }, []);

    useEffect(() => {
        const unsubscribe = firestore().collection('feeStatuses').onSnapshot(querySnapshot => {
            const feeStatuses = [];
            querySnapshot.forEach(documentSnapshot => {
                feeStatuses.push({
                    ...documentSnapshot.data(),
                    key: documentSnapshot.id,
                });
            });
            setFeeStatuses(feeStatuses);
        });

        return () => unsubscribe();
    }, []);

    const showModal = (feeStatus = null) => {
        if (feeStatus) {
            setSelectedFeeStatus(feeStatus);
            setStudentId(feeStatus.studentId);
            setStudentName(feeStatus.studentName);
            setFeeAmount(feeStatus.feeAmount);
            setPaidAmount(feeStatus.paidAmount);
            setPayableAmount(feeStatus.payableAmount);
            setPaymentDate(feeStatus.paymentDate);
            setLateFeeStatus(feeStatus.lateFeeStatus);
            setRemarks(feeStatus.remarks);
        } else {
            setSelectedFeeStatus(null);
            setStudentId('');
            setStudentName('');
            setFeeAmount('');
            setPaidAmount('');
            setPayableAmount('');
            setPaymentDate('');
            setLateFeeStatus('');
            setRemarks('');
        }
        setModalVisible(true);
    };

    const hideModal = () => {
        setModalVisible(false);
    };

    const addOrUpdateFeeStatus = async () => {
        if (selectedFeeStatus) {
            await firestore().collection('feeStatuses').doc(selectedFeeStatus.key).update({
                studentId,
                studentName,
                feeAmount,
                paidAmount,
                payableAmount,
                paymentDate,
                lateFeeStatus,
                remarks,
            });
        } else {
            await firestore().collection('feeStatuses').add({
                studentId,
                studentName,
                feeAmount,
                paidAmount,
                payableAmount,
                paymentDate,
                lateFeeStatus,
                remarks,
            });
        }
        hideModal();
    };

    const deleteFeeStatus = async (key) => {
        await firestore().collection('feeStatuses').doc(key).delete();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => showModal(item)}>
            <List.Item
                title={`Student ID: ${item.studentId}, Student Name: ${item.studentName}`}
                description={`Fee Amount: ${item.feeAmount}, Late Fee: ${item.lateFeeStatus}, Payment Date: ${item.paymentDate}`}
                right={props => <List.Icon {...props} icon="chevron-right" />}
            />
        </TouchableOpacity>
    );

    const handleStudentPress = (student) => {
        setSelectedStudent(student);
        setStudentId(student.registrationNumber);
        setStudentName(student.name);
        setIsEdit(true);
        setStudentModalVisible(false);
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Fee Status Management</Text>
            <FlatList
                data={feeStatuses}
                renderItem={renderItem}
                keyExtractor={item => item.key}
            />
            <Button mode="contained" onPress={() => showModal()} style={styles.button}>
                Add Fee Status
            </Button>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={hideModal}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <ScrollView>
                            <Text style={styles.modalTitle}>{selectedFeeStatus ? 'Edit Fee Status' : 'Add Fee Status'}</Text>
                            <Pressable
                                style={[styles.button, styles.buttonOpen]}
                                onPress={() => setStudentModalVisible(true)}
                            >
                                <Text style={styles.textStyle}>Select Student</Text>
                            </Pressable>
                            <TextInput
                                label="Student ID"
                                value={studentId}
                                onChangeText={setStudentId}
                                keyboardType="numeric"
                                style={styles.input}
                                editable={false}
                            />
                            <TextInput
                                label="Student Name"
                                value={studentName}
                                onChangeText={setStudentName}
                                style={styles.input}
                                editable={false}
                            />
                            <TextInput
                                label="Fee Amount"
                                value={feeAmount}
                                onChangeText={setFeeAmount}
                                keyboardType="numeric"
                                style={styles.input}
                            />
                            <TextInput
                                label="Paid Amount"
                                value={paidAmount}
                                onChangeText={setPaidAmount}
                                keyboardType="numeric"
                                style={styles.input}
                            />
                            <TextInput
                                label="Payable Amount"
                                value={payableAmount}
                                onChangeText={setPayableAmount}
                                keyboardType="numeric"
                                style={styles.input}
                            />
                            <TextInput
                                label="Payment Date"
                                value={paymentDate}
                                onChangeText={setPaymentDate}
                                style={styles.input}
                            />
                            <Text style={styles.feeStatusTitle}>Late Fee</Text>
                            <RadioButton.Group onValueChange={setLateFeeStatus} value={lateFeeStatus}>
                                <View style={styles.radioButtonContainer}>
                                    <RadioButton.Item label="Yes" value="Yes" />
                                    <RadioButton.Item label="No" value="No" />
                                </View>
                            </RadioButton.Group>
                            <TextInput
                                label="Remarks"
                                value={remarks}
                                onChangeText={setRemarks}
                                style={styles.input}
                            />
                            <View style={styles.modalActions}>
                                <View style={styles.new}>
                                <Button mode="contained" onPress={hideModal} style={styles.modalButton}>Cancel</Button>
                                <Button mode="contained" onPress={addOrUpdateFeeStatus} style={styles.modalButton}>
                                    {selectedFeeStatus ? 'Update' : 'Add'}
                                </Button>
                                </View>
                                <View>
                                {selectedFeeStatus && (
                                    <Button mode="contained" onPress={() => {
                                        deleteFeeStatus(selectedFeeStatus.key);
                                        hideModal();
                                    }} style={[styles.modalButton, styles.deleteButton]}>
                                        Delete
                                    </Button>
                                )}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="slide"
                transparent={true}
                visible={studentModalVisible}
                onRequestClose={() => setStudentModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Select Student</Text>
                        <FlatList
                            data={students}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => handleStudentPress(item)}
                                >
                                    <Text style={styles.itemText}>{item.registrationNumber}. {item.name}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={item => item.id}
                        />
                        <Button onPress={() => setStudentModalVisible(false)} style={styles.modalButton}>Close</Button>
                    </View>
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
    item: {
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        marginTop: 20,
        backgroundColor: '#446cb4',
    },
    input: {
        marginBottom: 10,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
        width: 0,
        height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    radioButtonContainer: {
        flexDirection: 'row',
    },
    feeStatusTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalActions: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 10,
    },
    new: {
        flexDirection: 'row',
    },
    modalButton: {
        marginHorizontal: 10,
    },
    deleteButton: {
        backgroundColor: 'red',
    },
});
