import React, { useCallback, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native'
import { Divider, Card, Text } from 'react-native-paper';
import useStorage from '../utils/Util_localStorage'
import { useFocusEffect } from '@react-navigation/native';
import { Util_apiServices } from '../utils/Util_apiServices';


const previos2 = [
    {
        sk_previo: 1,
        i_folio: 'PRE-000001',
        s_cliente: 'TRACSA S.A.P.I. DE C.V.',
        s_referencias: 'W20140001, W20140002, W20140003',
        s_bls: 'BL-000001, BL-0000002',
        s_guias: 'GUIA00001, GUIA00002, GUIA00003',
        s_recinto: 'Terminal Internacional de Manzanillo, S.A. de C.V.',
        s_contenedores: 'CONTENEDOR A, CONTENEDOR B',
    },
    {
        sk_previo: 2,
        i_folio: 'PRE-000002',
        s_cliente: 'TRACSA S.A.P.I. DE C.V.',
        s_referencias: 'W20140001, W20140002, W20140003',
        s_bls: 'BL-000001, BL-0000002',
        s_guias: 'GUIA00001, GUIA00002, GUIA00003',
        s_recinto: 'Terminal Internacional de Manzanillo, S.A. de C.V.',
        s_contenedores: 'CONTENEDOR A, CONTENEDOR B',
    },
    {
        sk_previo: 3,
        i_folio: 'PRE-000003',
        s_cliente: 'TRACSA S.A.P.I. DE C.V.',
        s_referencias: 'W20140001, W20140002, W20140003',
        s_bls: 'BL-000001, BL-0000002',
        s_guias: 'GUIA00001, GUIA00002, GUIA00003',
        s_recinto: 'Terminal Internacional de Manzanillo, S.A. de C.V.',
        s_contenedores: 'CONTENEDOR A, CONTENEDOR B',
    }
]

export default function Inicio({ navigation }) {
    const { Set, Get, Remove } = useStorage()
    const [cargandoPrevios, setCargandoPrevios] = useState(false)
    const [previos, setPrevios] = useState([]);

    const cargarSucursales = async (sk_previo) => {
        navigation.navigate('Detalles', { sk_previo })
    }

    const obtenerDatos = async () => {
        const result = await Util_apiServices('/api/agen/traf/prev-apli/api-previos/obtenerPrevios', 'GET')
        console.log(result.data)
        setPrevios(result.data)
    }

    useFocusEffect(
        useCallback(() => {
            obtenerDatos();
        }, [])
    );

    return (
        <View style={{ flex: 1, gap: 6, padding: 6, backgroundColor: '#e5e7eb' }}>
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={cargandoPrevios} onRefresh={obtenerDatos} />
                }
            >
                {
                    Object.values(previos).length > 0 &&
                    Object.entries(previos).map(([sk_previo, previo], index) => {

                        return (
                            <Card key={sk_previo} style={{ marginBottom: 10, backgroundColor: 'white' }}>
                                <Card.Content>
                                    <TouchableOpacity key={index} onPress={() => cargarSucursales(previo?.sk_previo)}>
                                        <View style={{ flexDirection: 'column' }}>
                                            <Text style={{ color: 'red', fontWeight: 'bold' }} variant="titleLarge">{previo?.i_folio}</Text>
                                            <Text variant="bodyLarge" numberOfLines={1}>{previo?.s_nombre_cliente}</Text>
                                            <Text variant="bodyLarge" numberOfLines={1}>{previo?.empresa_terminal}</Text>
                                            <Divider style={{ marginVertical: 5 }}></Divider>
                                            <Text variant="labelLarge" numberOfLines={1}>{previo?.s_referencias}</Text>
                                            <Text variant="labelLarge" numberOfLines={1}>{previo?.s_contenedores || '-'}</Text>
                                            <Text variant="labelLarge" numberOfLines={1}>{previo?.s_bls || '-'}</Text>
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
