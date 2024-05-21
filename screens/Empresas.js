import React, { useState } from 'react'
import { Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import { useRoute } from "@react-navigation/native";
import { Surface, Card } from 'react-native-paper';


export default function Empresas({ navigation }) {
    const route = useRoute();

    const { empresas, datos } = route.params;

    const cargarSucursales = async (sk_empresa, empresa) => {
        navigation.navigate('Sucursales', {
            sucursales: empresa?.sucursales,
            datos: {
                ...datos,
                sk_empresa: sk_empresa
            }
        })
    }

    return (
        <View style={{ flex: 1, gap: 6, padding: 6, backgroundColor: '#e5e7eb' }}>
            <ScrollView>

                {
                    Object.values(empresas).length > 0 &&
                    Object.entries(empresas).map(([sk_empresa, empresa], index) => {
                        return (

                            <Card key={sk_empresa} style={{ marginBottom: 10, backgroundColor: '#3b82f6' }}>
                                <Card.Content>
                                    <TouchableOpacity key={index} onPress={() => cargarSucursales(sk_empresa, empresa)}>
                                        <View style={{ flexDirection: 'column' }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 26, color: 'white' }} numberOfLines={1}>{empresa?.s_nombre_comercial}</Text>
                                            <Text style={{ fontWeight: 'normal', fontSize: 17, color: 'white' }}>{empresa?.s_razon_social}</Text>
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
