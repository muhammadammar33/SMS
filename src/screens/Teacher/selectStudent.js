/* eslint-disable prettier/prettier */
import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function SelectStudent() {
    const route = useRoute();
    const navigation = useNavigation();
    const { students, handleSelectStudent } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Student</Text>
            <FlatList
                data={students}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => {
                            handleSelectStudent(item);
                            navigation.goBack();
                        }}
                    >
                        <Text style={styles.itemText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
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
    item: {
        padding: 15,
        backgroundColor: '#f8f8f8',
        marginBottom: 10,
        borderRadius: 5,
    },
    itemText: {
        fontSize: 18,
    },
});
