import React from 'react'
import useStorage from '../utils/Util_localStorage'
import { CommonActions } from '@react-navigation/native';

export default Util_validarStorage = async (props) => {

    const { Set, Get, Remove } = useStorage()
    const { navigation } = props

    const usuario = await Get('usuario')
    //Validar que no exista el storage
    if (usuario) {

        const sk_empresa = JSON.parse(usuario)?.sk_empresa
        const i_administrador = JSON.parse(usuario)?.i_administrador

        //No tienes empresa, te saca
        if (!sk_empresa) {
            //verificar si existe i_administrador
            if (i_administrador === undefined) {

                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [
                            { name: 'Login' },
                        ],
                    })
                );

            }

            //verificar que tipo de usuario eres
            if (i_administrador === 1) {

                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [
                            { name: 'Administrador' },
                        ],
                    })
                );

            } else {

                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [
                            { name: 'Login' },
                        ],
                    })
                );

            }
        }

        return JSON.parse(usuario)

    } else {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [
                    { name: 'Login' },
                ],
            })
        );
    }

}


