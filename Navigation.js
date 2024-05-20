import React, { useEffect, useState } from 'react'

import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import useStorage from './utils/Util_localStorage'


//Screens
import Login from './screens/Login'
import Empresas from './screens/Empresas'
import Sucursales from './screens/Sucursales'
import Inicio from './screens/Inicio'
import DetallesPrevio from './screens/DetallesPrevio'


import Test from './screens/Test'

const Stack = createNativeStackNavigator();

function StackUsuario({ color }) {

    const { Set, Get, Remove } = useStorage()
    const [ruta_inicial, set_ruta_inicial] = useState('Login');
    const [cargando, set_cargando] = useState(false);
    const [nombreConsulta, set_nombreConsulta] = useState('');

    useEffect(() => {
        //obtener_storage()
    }, [])

    const obtener_storage = async () => {
        await Set('color', { color })
        set_cargando(true)
        const usuario = await Get('usuario')
        if (usuario) {
            const sk_empresa = JSON.parse(usuario)?.sk_empresa
            const i_administrador = JSON.parse(usuario)?.i_administrador
            const s_nombre_empresa = JSON.parse(usuario)?.s_nombre_empresa
            if (i_administrador === 1 && sk_empresa === undefined) {
                set_ruta_inicial('Administrador')
            } else {
                set_nombreConsulta(s_nombre_empresa)
                set_ruta_inicial('UsuariosScreen')
            }
        } else {
            set_ruta_inicial('Login')
        }
        set_cargando(false)
    }

    return (
        <>
            {
                !cargando &&
                <Stack.Navigator
                    initialRouteName={ruta_inicial}
                >

                    {/* Login */}
                    <Stack.Screen
                        name='Login'
                        component={Login}

                        options={{
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: colorPrimary.color, // Aquí puedes poner el color que desees
                            },
                            headerTintColor: 'white',
                            headerTitleAlign: 'center',
                            headerTitle: '',
                        }}
                    />

                    {/* Empresas */}
                    <Stack.Screen
                        name='Empresas'
                        component={Empresas}

                        options={{
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: colorPrimary.color, // Aquí puedes poner el color que desees
                            },
                            headerTintColor: 'white',
                            headerTitleAlign: 'center',
                            headerTitle: 'Empresas',
                        }}
                    />

                    {/* Sucursales */}
                    <Stack.Screen
                        name='Sucursales'
                        component={Sucursales}

                        options={{
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: colorPrimary.color, // Aquí puedes poner el color que desees
                            },
                            headerTintColor: 'white',
                            headerTitleAlign: 'center',
                            headerTitle: 'Sucursales',
                        }}
                    />

                    {/* INICIO */}
                    <Stack.Screen
                        name='Inicio'
                        component={Inicio}

                        options={{
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: colorPrimary.color, // Aquí puedes poner el color que desees
                            },
                            headerTintColor: 'white',
                            headerTitleAlign: 'center',
                            headerTitle: 'Previos',
                        }}
                    />

                    {/* DETALLES DEL PREVIO */}
                    <Stack.Screen
                        name='Detalles'
                        component={DetallesPrevio}

                        options={{
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: colorPrimary.color, // Aquí puedes poner el color que desees
                            },
                            headerTintColor: 'white',
                            headerTitleAlign: 'center',
                            headerTitle: 'Detalles',
                        }}
                    />

                    {/* PRUEBA */}
                    <Stack.Screen
                        name='Prueba'
                        component={Test}

                        options={{
                            headerStyle: {
                                backgroundColor: colorPrimary.color, // Aquí puedes poner el color que desees
                            },
                            headerTintColor: 'white',
                            headerTitleAlign: 'center',
                            headerTitle: 'asdasd',
                        }}
                    />

                </Stack.Navigator>
            }
        </>

    )
}

export default function Navigation({ color }) {
    return (
        <NavigationContainer>
            <StackUsuario color={color}></StackUsuario>
        </NavigationContainer>
    )
}
