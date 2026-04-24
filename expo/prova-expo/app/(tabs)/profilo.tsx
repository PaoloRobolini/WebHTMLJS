import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MyProfilo = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.titolo}>Il mio boia di profilo</Text>
                <Text style={styles.sottotitolo}>Sto testando un codice molto probabilmente storto</Text>
            </View>
            <View style={styles.flexContainer}>
                <View style={styles.box} >
                    <Text style = {styles.sottotitolo}>Testo1</Text>
                </View>
                <View style={styles.box} >
                    <Text style = {styles.sottotitolo}>Testo2</Text>
                </View>
                <View style={styles.box} >
                    <Text style = {styles.sottotitolo}>Testo3</Text>
                </View>
                <View style={styles.box} >
                    <Text style = {styles.sottotitolo}>Testo4</Text>
                </View>
                <View style={styles.box} >
                    <Text style = {styles.sottotitolo}>Testo5</Text>
                </View>
                <View style={styles.box} >
                    <Text style = {styles.sottotitolo}>Testo6</Text>
                </View>
                
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
    box : {
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

export default MyProfilo;