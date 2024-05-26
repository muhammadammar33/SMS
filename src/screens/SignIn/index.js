/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import { View, Image, StyleSheet, Alert } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function SignInScreen({navigation}) {
    const [username, setusername] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const handleSignIn = () => {
        if (username === 'admin' && password === 'Admin123') {
            navigation.replace('AdminDashboard');
        } else {
            Alert.alert('Invalid Credentials', 'Please check your username and password.');
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/signin.jpg')}
                style={styles.logo}
            />
            <Text style={styles.title}>Han yeh kar lo pehly</Text>
            <TextInput
                label="User Name"
                value={username}
                onChangeText={text => setusername(text)}
                mode="outlined"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                accessibilityLabel="User Name"
            />
            <TextInput
                label="Password"
                value={password}
                onChangeText={text => setPassword(text)}
                mode="outlined"
                secureTextEntry={secureTextEntry}
                right={<TextInput.Icon name={secureTextEntry ? 'eye' : 'eye-off'} onPress={() => setSecureTextEntry(!secureTextEntry)}/>}
                style={styles.input}
                accessibilityLabel="Password"
            />
            <Text style={styles.forgotPassword} onPress={() => Alert.alert('Forgot Password', 'Feature not implemented.')}>Forgot Password?</Text>
            <Button
                mode="contained"
                onPress={handleSignIn}
                style={styles.button}
                disabled={!username || !password}
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
