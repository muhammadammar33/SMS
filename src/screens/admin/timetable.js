/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { launchImageLibrary } from 'react-native-image-picker';

export default function UploadRemoveTimetable() {
    const [timetableUrl, setTimetableUrl] = useState(null);

    useEffect(() => {
        // Fetch the current timetable URL from Firestore
        const fetchTimetable = async () => {
        const timetableDoc = await firestore().collection('timetable').doc('current').get();
        if (timetableDoc.exists) {
            setTimetableUrl(timetableDoc.data().url);
        }
        };

        fetchTimetable();
    }, []);

    const handleUpload = async () => {
        launchImageLibrary({ mediaType: 'photo' }, async (response) => {
            if (response.didCancel) {
            console.log('User cancelled image picker');
            } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorMessage);
            } else {
            const { uri } = response.assets[0];
            const filename = uri.substring(uri.lastIndexOf('/') + 1);
            const reference = storage().ref(`timetables/${filename}`);

            const task = reference.putFile(uri);

            task.on('state_changed', taskSnapshot => {
                console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
            });

            task.then(async () => {
                console.log('File uploaded successfully!');
                try {
                const url = await reference.getDownloadURL();
                await firestore().collection('timetable').doc('current').set({ url });
                setTimetableUrl(url);
                console.log('Timetable URL saved to Firestore:', url);
                } catch (error) {
                console.error('Failed to get download URL: ', error);
                }
            }).catch(error => {
                console.error('Image upload error: ', error);
            });
            }
        });
    };

    const handleRemove = async () => {
        try {
            // Fetch the timetable document from Firestore
            const timetableDoc = await firestore().collection('timetable').doc('current').get();
            if (timetableDoc.exists) {
                const url = timetableDoc.data().url;
                console.log('Timetable URL: ', url);

                // Extract the filename from the URL without duplicating the 'timetables/' part
                const filename = decodeURIComponent(url.split('/').pop().split('?')[0]);
                console.log('Extracted filename: ', filename);

                // Create a reference to the file in Firebase Storage
                const reference = storage().ref(`${filename}`);
                console.log('Storage reference: ', reference.fullPath);

                // Delete the file from Firebase Storage
                await reference.delete();
                console.log('File removed from storage');

                // Delete the document from Firestore
                await firestore().collection('timetable').doc('current').delete();
                console.log('Document removed from Firestore');

                // Update the state
                setTimetableUrl(null);
            } else {
                console.log('No timetable found to remove');
            }
        } catch (error) {
            console.error('Image delete error: ', error);
        }
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Timetable</Text>
        {timetableUrl ? (
            <Image source={{ uri: timetableUrl }} style={styles.image} />
        ) : (
            <Text>No timetable uploaded</Text>
        )}
        <Button mode="contained" onPress={handleUpload} style={styles.button}>
            Upload Timetable
        </Button>
        {timetableUrl && (
            <Button mode="contained" onPress={handleRemove} style={styles.button}>
            Remove Timetable
            </Button>
        )}
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#446cb4',
    },
    image: {
        width: '100%',
        height: 300,
        marginBottom: 20,
    },
    button: {
        marginVertical: 10,
        backgroundColor: '#446cb4',
    },
});
