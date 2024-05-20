import React, { useState } from 'react'
import { Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useRoute } from "@react-navigation/native";
import { Surface, Card } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';
import { Util_apiServices } from '../utils/Util_apiServices';
import useStorage from '../utils/Util_localStorage'

export default function Sucursales({ navigation }) {
    const route = useRoute();
    const { Set, Get, Remove } = useStorage()

    const { sucursales, datos } = route.params;

    const IniciarSesion = async (sk_sucursal, sucursal) => {

        const params = {
            ...datos,
            sk_sucursal: sk_sucursal
        }
         
        const result = await Util_apiServices('/api/core/prin/inic-sesi/iniciar-sesion/configurarInicio', 'POST', params)
        if (!result || !result?.success) {
            alert('Error al iniciar sesión')
            return false;
        }

        const storage_data = {
            sk_token: result.data.sk_token,
            s_nombre: params.s_nombre,
            s_apellido_paterno: params.s_apellido_paterno,
            s_apellido_materno: params.s_apellido_materno,
        }

        await Set('usuario', storage_data)

        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'Inicio' },
                ],
            })
        );

    }

    return (
        <View style={{ flex: 1, gap: 6, padding: 6, backgroundColor: '#e5e7eb' }}>
            <ScrollView>

                {
                    Object.values(sucursales).length > 0 &&
                    Object.entries(sucursales).map(([sk_sucursal, sucursal], index) => {
                        return (
                            <Card key={sk_sucursal} style={{ marginBottom: 10, backgroundColor: '#22c55e' }}>
                                <Card.Content>
                                    <TouchableOpacity key={index} onPress={() => IniciarSesion(sk_sucursal, sucursal)}>
                                        <View style={{ flexDirection: 'column' }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 26, color: 'white' }} numberOfLines={1}>{sucursal?.s_nombre}</Text>
                                        </View>
                                    </TouchableOpacity>
                                </Card.Content>
                            </Card>


                        )
                    })
                }

            </ScrollView>
        </View>
    )
}
