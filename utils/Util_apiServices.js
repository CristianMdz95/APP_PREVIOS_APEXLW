

//const host = 'http://192.168.1.75:3001'
const host = 'http://192.168.100.11:3001'
//const host = 'https://apexlw.woodward.mx'

import useStorage from '../utils/Util_localStorage'
import axios from 'axios';

const Util_apiServices = async (endpoint, type, data = undefined) => {

    const { Set, Get, Remove } = useStorage()

    /* Obtener el token */
    let storageUsuario = JSON.parse(await Get('usuario') || null);

    let response;
    let url = `${host}${endpoint}`;
    let datosParams = data;

    let headers = {
        'Content-Type': 'application/json'
    }

    //Existen storage, le agregamos el token
    if (storageUsuario) {
        headers = { ...headers, 'Authorization': `Bearer ${storageUsuario?.sk_token}` }
    }

    

    if (type === 'GET') {
        const queryParams = new URLSearchParams(datosParams);
        url = `${url}/?${queryParams.toString()}`;
        response = await axios.get(url, { headers })
    }

    if (type === 'POST') {
        response = await axios.post(url, datosParams, { headers });
    }
    
    return response.data

}

const Util_apiForm = async (endpoint, type, dataForm = null) => {
    if (type === 'POST') {
        const res = await fetch(host + endpoint, {
            method: 'POST',
            body: dataForm,
            headers: {
                'content-type': 'multipart/form-data',
            },
        });
        return res
    }
}

const Util_getUrl = () => {
    return host
}

const Util_getVersion = async () => {

    const res = await fetch(host + 'obtenerVersion', {
        method: 'POST',
        body: null,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const response = await res.json()
    return response

}

export { Util_apiServices, Util_apiForm, Util_getUrl, Util_getVersion }