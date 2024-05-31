/* eslint-disable prettier/prettier */
/* eslint-disable no-alert */
import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

export default function UploadRemoveSyllabus() {
    const [imageUri, setImageUri] = useState(null);
    const [className, setClassName] = useState('');
    const [syllabusUrl, setSyllabusUrl] = useState(null);

    const handleUpload = async () => {
        if (!imageUri || !className) {
            alert('Please select an image and enter a class name');
            return;
        }

        const filename = imageUri.substring(imageUri.lastIndexOf('/') + 1);
        const reference = storage().ref(`syllabus/${className}/${filename}`);

        try {
            await reference.putFile(imageUri);
            const url = await reference.getDownloadURL();

            // Fetch the document where the class name matches
            const classQuery = await firestore().collection('classes').where('name', '==', className).get();

            if (!classQuery.empty) {
                // Update the URL in the document
                classQuery.forEach(async (doc) => {
                    await doc.ref.update({ url });
                });
                setSyllabusUrl(url);
                alert('Syllabus uploaded successfully');
            } else {
                alert('Class not found');
            }
        } catch (error) {
            console.error('Failed to upload syllabus: ', error);
            alert('Failed to upload syllabus');
        }
    };

    const handleRemove = async () => {
        if (!className) {
            alert('Please enter a class name');
            return;
        }

        try {
            // Fetch the document where the class name matches
            const classQuery = await firestore().collection('classes').where('name', '==', className).get();

            if (!classQuery.empty) {
                classQuery.forEach(async (doc) => {
                    const { url } = doc.data();
                    if (url) {
                        const filename = url.substring(url.lastIndexOf('/') + 1, url.indexOf('?'));
                        const reference = storage().ref(`syllabus/${className}/${filename}`);
                        await reference.delete();
                        await doc.ref.update({ url: firestore.FieldValue.delete() });
                        setSyllabusUrl(null);
                        alert('Syllabus removed successfully');
                    } else {
                        alert('No syllabus URL found for the specified class');
                    }
                });
            } else {
                alert('Class not found');
            }
        } catch (error) {
            console.error('Failed to remove syllabus: ', error);
            alert('Failed to remove syllabus');
        }
    };

    const selectImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.assets.length > 0) {
                const { uri } = response.assets[0];
                setImageUri(uri);
            }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Upload/Remove Syllabus</Text>
            <TextInput
                label="Class Name"
                value={className}
                onChangeText={setClassName}
                style={styles.input}
            />
            <Button mode="contained" onPress={selectImage} style={styles.button}>
                Select Image
            </Button>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
            <Button mode="contained" onPress={handleUpload} style={styles.button}>
                Upload Syllabus
            </Button>
            <Button mode="contained" onPress={handleRemove} style={styles.button}>
                Remove Syllabus
            </Button>
            {syllabusUrl && (
                <View style={styles.preview}>
                    <Text style={styles.previewText}>Uploaded Syllabus:</Text>
                    <Image source={{ uri: syllabusUrl }} style={styles.image} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    input: {
        marginBottom: 20,
    },
    button: {
        marginVertical: 10,
        backgroundColor: '#446cb4',
    },
    image: {
        width: '100%',
        height: 300,
        marginVertical: 10,
    },
    preview: {
        marginTop: 20,
    },
    previewText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});
