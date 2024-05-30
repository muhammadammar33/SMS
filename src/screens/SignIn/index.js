/* eslint-disable prettier/prettier */
/* eslint-disable no-shadow */
import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Alert } from 'react-native';
import { Button, Text, TextInput, ActivityIndicator } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

export default function SignInScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch students and teachers from Firestore
        const fetchData = async () => {
            const studentList = [];
            const teacherList = [];

            const studentSnapshot = await firestore().collection('students').get();
            studentSnapshot.forEach(doc => {
                studentList.push({ id: doc.id, ...doc.data() });
            });

            const teacherSnapshot = await firestore().collection('teachers').get();
            teacherSnapshot.forEach(doc => {
                teacherList.push({ id: doc.id, ...doc.data() });
            });

            setStudents(studentList);
            setTeachers(teacherList);
            setLoading(false);
        };

        fetchData();
    }, []);

    const handleSignIn = () => {
        if (username === 'admin' && password === 'Admin123') {
            navigation.replace('AdminDashboard');
        } else {
            const student = students.find(student => student.name === username);
            const teacher = teachers.find(teacher => teacher.name === username);

            if (student && student.password === password) {
                navigation.replace('StudentDashboard', { student });
            } else if (teacher && teacher.password === password) {
                navigation.replace('TeacherDashboard', { teacher });
            } else {
                Alert.alert('Invalid Credentials', 'Please check your username and password.');
            }
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/signin.jpg')}
                style={styles.logo}
            />
            <Text style={styles.title}>Sign In</Text>
            <TextInput
                label="User Name"
                value={username}
                onChangeText={text => setUsername(text)}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                accessibilityLabel="User Name"
            />
            <TextInput
                label="Password"
                value={password}
                onChangeText={text => setPassword(text)}
                mode="outlined"
                secureTextEntry={secureTextEntry}
                right={<TextInput.Icon name={secureTextEntry ? 'eye' : 'eye-off'} onPress={() => setSecureTextEntry(!secureTextEntry)} />}
                style={styles.input}
                accessibilityLabel="Password"
            />
            <Text style={styles.forgotPassword} onPress={() => Alert.alert('Forgot Password', 'Feature not implemented.')}>Forgot Password?</Text>
            <Button
                mode="contained"
                onPress={handleSignIn}
                style={styles.button}
                disabled={!username || !password || loading}
            >
                Sign In
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
    loading: {
        flex: 1,
        justifyContent: 'center',
    },
    logo: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#446cb4',
    },
    input: {
        marginBottom: 10,
    },
    forgotPassword: {
        textAlign: 'right',
        color: '#446cb4',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#446cb4',
    },
});
