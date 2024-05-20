import React, { useState, useCallback } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { TextInput, Button, Checkbox } from 'react-native-paper'
import { Util_apiServices } from '../utils/Util_apiServices'
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import useStorage from '../utils/Util_localStorage'
import { showMessage } from 'react-native-flash-message'
import colorPrimary from '../data/ColorPrimary'

export default function Login({ navigation }) {

    const [usuario, set_usuario] = useState('cmendoza');
    const [password, set_password] = useState('123456');

    const [cargandoInicio, set_cargandoInicio] = useState(false)
    const [checked, setChecked] = React.useState(false);

    const { Set, Get, Remove } = useStorage()

    useFocusEffect(
        useCallback(() => {
            respaldarCredenciales();
        }, [])
    );

    const respaldarCredenciales = async () => {
        await Remove('usuario')
        const credenciales = await Get('credenciales')
        if (credenciales) {
            set_usuario(JSON.parse(credenciales)?.usuario)
            set_password(JSON.parse(credenciales)?.password)
            setChecked(true)
        }
    }

    const iniciar_sesion = async () => {
        //set_cargandoInicio(true)
            
        const result = await Util_apiServices('/api/core/prin/inic-sesi/iniciar-sesion/iniciarSesion', 'POST', {
            s_usuario_correo: usuario,
            s_password: password
        })

        if (!result || !result?.success) {
            alert(result?.message)
            //set_cargandoInicio(false)
            return false;
        }

        navigation.navigate('Empresas', {
            empresas: result.data.empresas,
            datos: {
                s_usuario_correo: usuario,
                s_password: password,
                s_nombre: result.data?.usuario?.s_nombre,
                s_apellido_paterno: result.data?.usuario?.s_apellido_paterno,
                s_apellido_materno: result.data?.usuario?.s_apellido_materno,
            }
        })
        return true;
        //set_cargandoInicio(false)
    }

    return (
        <View style={{ height: '100%', backgroundColor: 'white' }}>

            <View style={{ paddingTop: '20%', backgroundColor: colorPrimary.color, height: '97%', borderBottomRightRadius: 325 }}>

                <ScrollView style={{ width: '100%' }}>

                    <View >
                        <View style={{ alignItems: 'center' }}>

                            <Image
                                resizeMode='cover'
                                style={{
                                    borderWidth: 0,
                                    width: 280,
                                    height: 70,

                                }}
                                source={require('../assets/Logo/logo_apex.png')}
                            />
                        </View>


                        <View style={{ gap: 25 }}>

                            <View style={{ width: '100%' }}>
                                <View style={{ paddingLeft: 10, paddingBottom: 5 }}>
                                    <Text style={{ fontSize: 18, color: 'white', fontWeight: '400' }}>Usuario</Text>
                                </View>

                                <View style={{ width: '100%', alignItems: 'center' }}>
                                    <TextInput
                                        placeholder='Usuario'
                                        onChangeText={text => set_usuario(text)}
                                        style={{ width: '95%' }}
                                        value={usuario}
                                    />
                                </View>
                            </View>

                            <View style={{ width: '100%' }}>
                                <View style={{ paddingLeft: 10, paddingBottom: 5 }}>
                                    <Text style={{ fontSize: 18, color: 'white', fontWeight: '400' }}>Contraseña</Text>
                                </View>

                                <View style={{ width: '100%', alignItems: 'center' }}>
                                    <TextInput
                                        placeholder='Contraseña'
                                        onChangeText={text => set_password(text)}
                                        secureTextEntry={true}
                                        style={{ width: '95%' }}
                                        value={password}
                                    />

                                </View>

                                <View style={{ width: '100%', alignItems: 'center', flexDirection: 'row' }}>
                                    <Checkbox
                                        color='white'
                                        status={checked ? 'checked' : 'unchecked'}
                                        onPress={() => {
                                            setChecked(!checked);
                                        }}
                                    />
                                    <Text style={{ color: 'white' }}>Recordar Credenciales</Text>
                                </View>

                            </View>

                            <View style={{ width: '100%' }}>
                                <View style={{ width: '100%', alignItems: 'center' }}>
                                    <TouchableOpacity style={{ backgroundColor: cargandoInicio ? '#B5C0D0' : 'white', padding: 15, borderRadius: 5, width: '40%' }}
                                        disabled={false}
                                        onPress={iniciar_sesion}>
                                        <Text style={{ textAlign: 'center', fontSize: 16 }}>{cargandoInicio ? 'Cargando...' : 'Iniciar Sesión'}</Text>
                                    </TouchableOpacity>

                                    <View style={{ paddingTop: 7 }}>
                                        <Text style={{ color: 'white', fontSize: 12 }}> V1.0</Text>
                                    </View>
                                </View>
                            </View>

                        </View>
                    </View>
                </ScrollView>

            </View>
        </View>
    )
}
