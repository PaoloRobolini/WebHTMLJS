import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const input = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.titolo}>Ora input io</Text>
            </View>
            <View style = {styles.card}>
                <FlatList data = {[1,2,3,4,5,6, 7, 8, 9, 10, 11, 12, 13, 14]}
                renderItem = {({item}) => <View style={styles.box} >
                    <Text style = {styles.sottotitolo}>Testo{item}</Text>
                </View>}
                keyExtractor = {(item) => item.toString()}
                 />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    flexContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        width: 50,
        height: 50,
        backgroundColor: 'brandblue',
        borderColor: 'black',
        borderWidth: 1,
        margin: 5,
    },
    card: {
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        margin: 10,
        elevation: 3,
    },
    titolo: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    sottotitolo: {
        fontSize: 16,
        color: 'gray',
    }
});

export default input;