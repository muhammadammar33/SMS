/* eslint-disable prettier/prettier */
import React, {useEffect} from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function App() {
    const [teachers, setTeachers] = React.useState([]);

    useEffect(() => {
        getDatabase();
    }, []);

    const getDatabase = async () => {
        const data = await firestore().collection('teachers').get();
        setTeachers(data.docs.map((doc) => doc.data()));
        console.log(data);
    };

    return (
        <View style={styles.container}>
        <FlatList
            data={teachers}
            renderItem={({item}) => (
            <View style={styles.item}>
                <Text>{item.name}</Text>
                <Text>{item.subject}</Text>
            </View>
            )}
        />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    item: {
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
});
