import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function localStorage() {

    const Set = async (key, data = {}) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            // Guardar el error
            alert('ERROR AL GUARDAR STORAGE')
            console.log(error);
        }
    };

    const Get = async (key) => {
        try {
            const item = await AsyncStorage.getItem(key);
            if (item !== null) {
                return item
            }

        } catch (error) {
            // Guardar el error
            alert('ERROR AL OBTENER EL STORAGE')
            console.log(error);
        }
    };


    const Remove = async (key) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            // Guardar el error
            alert('ERROR AL REMOVER STORAGE')
            console.log(error);
        }
    };


    return { Set, Get, Remove }

}
