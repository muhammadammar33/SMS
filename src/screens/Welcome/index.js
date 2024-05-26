/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import {ImageBackground} from 'react-native';

export default function Welcome({navigation}) {
    setTimeout(() => {
        navigation.replace('SignIn');
    }, 3000);
    return (
        <ImageBackground
            source={require('../../assets/images/welcome.png')}
            style={{width: '100%', height: '100%'}}/>
    );
}
