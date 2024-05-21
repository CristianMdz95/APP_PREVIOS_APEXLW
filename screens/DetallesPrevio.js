import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, TouchableOpacity, View, Modal, Pressable } from 'react-native'
import { Text, Card, Divider, Chip, Avatar, Button, IconButton, Portal, Dialog } from 'react-native-paper';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import ColorPrimary from '../data/ColorPrimary';
import Select from '../components/Select';
import { Image } from 'expo-image';
import NetInfo from '@react-native-community/netinfo';
import { useFocusEffect } from '@react-navigation/native';
import { Util_apiForm, Util_apiServices } from '../utils/Util_apiServices';
import { useRoute } from "@react-navigation/native";

import { Util_dateFormat } from '../utils/Util_dateFormat'

/* IMAGANES */
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';


const previo2 = {
    sk_previo: 1,
    i_folio: 'PRE-000001',
    s_cliente: 'TRACSA S.A.P.I. DE C.V.',
    s_referencias: 'W20140001, W20140002, W20140003',
    s_bls: 'BL-000001, BL-0000002',
    s_guias: 'GUIA00001, GUIA00002, GUIA00003',
    s_recinto: 'Terminal Internacional de Manzanillo, S.A. de C.V.',
    s_contenedores: 'CONTENEDOR A, CONTENEDOR B',
}

const arrayModelos = [
    {
        label: 'Vacío',
        value: null
    },
    {
        label: 'Modelo 1',
        value: 'MODELO1'
    },
    {
        label: 'Modelo 2',
        value: 'MODELO2'
    },
];

export default function DetallesPrevio({ navigation }) {
    const bottomSheetRef = useRef(null);
    const route = useRoute();

    const { sk_previo } = route.params;

    /* IMAGENES */
    const [imagenes_subidas, set_imagenes_subidas] = useState([]);
    const [imagenes_no_subidas, set_imagenes_no_subidas] = useState([]);
    const [numImagesSubidas, setTotalSubidas] = useState(0);
    const [numImagesNoSubidas, setTotalNoSubidas] = useState(0);
    const [isModalVisible, setModalVisible] = useState(false);
    const [uriImg, setUriImg] = useState(null);

    const [previo, setPrevio] = useState(null)
    const [formContenedor, setFormContenero] = useState(null)
    const [formModelo, setFormModelo] = useState(null)

    const [contenedor, setContenedor] = useState([])

    /* **************************** */

    useEffect(() => {
        contarImagenes();
    }, []);

    const abrirCamara = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                //allowsEditing: true,
                //aspect: [4, 3],
                quality: 1,
            });


            if (result.assets[0].uri) {
                //setImage(result.assets[0].uri);

                /* guardar en la librería del telefono */
                await guardarImagen(result.assets[0].uri);

                /* Agregar las imagenes en una carpeta separada */
                await crearCarpetaFotos(result.assets[0].uri);

                /* Ir por las fotos y meterlas al stado */
                contarImagenes();

                //Volver a abrir la camara
                abrirCamara();
            }
            contarImagenes();
        } catch (error) {
            console.log('Error al tomar la foto:', error);
        }
    };

    /* Guardar en la librería del dispositivo */
    const guardarImagen = async (uri) => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
                await MediaLibrary.saveToLibraryAsync(uri);
            }
        } catch (error) {
            console.log('Error al guardar la imagen:', error);
        }
    };

    /* Crear las carpetas en donde se registran las fotos */
    const crearCarpetaFotos = async (imageUri) => {
        try {

            // FileSystem.documentDirectory = file:///data/user/0/host.exp.exponent/files/

            const subidasFolderName = 'imagenes_subidas';
            const noSubidasFolderName = 'imagenes_no_subidas';

            const urlLocal = FileSystem.documentDirectory + previo?.sk_previo + '/'
            const subidasFolderUri = urlLocal + subidasFolderName;
            const noSubidasFolderUri = urlLocal + noSubidasFolderName;

            // Crear carpetas si no existen
            await FileSystem.makeDirectoryAsync(subidasFolderUri, { intermediates: true });
            await FileSystem.makeDirectoryAsync(noSubidasFolderUri, { intermediates: true });

            // Obtener el nombre de la imagen
            const nombreImagen = imageUri.split('/').pop();

            // Mover la imagen a la carpeta correspondiente

            //validacion en caso de que no tengamos internet
            const folderToMove = await validarSubirImagen() ? subidasFolderUri : noSubidasFolderUri;

            await FileSystem.moveAsync({
                from: imageUri,
                to: folderToMove + '/' + nombreImagen,
            });

        } catch (error) {
            console.log('Error al crear las carpetas personalizadas:', error);
        }
    };

    /* Validar si hay conexión a internet */
    const validarSubirImagen = async () => {
        try {
            const state = await NetInfo.fetch();
            return !state.isConnected;
        } catch (error) {
            console.log('Error al verificar la conexión a Internet:', error);
            return false;
        }
    };

    const contarImagenes = async () => {
        try {

            const subidasFolderName = 'imagenes_subidas';
            const noSubidasFolderName = 'imagenes_no_subidas';

            const urlLocal = FileSystem.documentDirectory + previo?.sk_previo + '/'

            const subidasFolderUri = urlLocal + subidasFolderName;
            const noSubidasFolderUri = urlLocal + noSubidasFolderName;

            /* Leer el directorio local de tu telefono */
            const subidasFiles = await FileSystem.readDirectoryAsync(subidasFolderUri);
            const noSubidasFiles = await FileSystem.readDirectoryAsync(noSubidasFolderUri);


            /* Eliminar las fotos */
            /*             for (const filename of subidasFolderUri) {
                            await FileSystem.deleteAsync(`${subidasFolderUri}/${filename}`, { idempotent: true });
                        }
            
                        for (const filename of noSubidasFolderUri) {
                            await FileSystem.deleteAsync(`${noSubidasFolderUri}/${filename}`, { idempotent: true });
                        } */


            /* Tener el total de las imagenes */
            setTotalSubidas(subidasFiles.length);
            setTotalNoSubidas(noSubidasFiles.length);

            /* Agregar las imagenes al estado */
            set_imagenes_subidas(subidasFiles.reverse().map(filename => ({ uri: `${subidasFolderUri}/${filename}` })));
            set_imagenes_no_subidas(noSubidasFiles.reverse().map(filename => ({ uri: `${noSubidasFolderUri}/${filename}` })));

        } catch (error) {
            console.log('Error al contar las imágenes:', error);
        }
    };

    const obtenerDatos = async () => {
        const result = await Util_apiServices('/api/agen/traf/prev-apli/api-previos/obtenerPrevio', 'POST', { sk_previo })
        setPrevio(result.data)

        let ok = result.data.contenedores.map((contendor) => ({
            label: contendor.s_numero_contenedor,
            value: contendor.s_numero_contenedor
        }))

        console.log(ok)
    }

    const subirFotos = async () => {
        try {
            if(imagenes_no_subidas.length === 0){
                alert("No se encontraron archivos.");
                return false;
            }
            const digi = await api_procesarArchivosDigitalizacion(sk_previo, imagenes_no_subidas, {
                s_clave_expediente: 'PREVIO',
                s_clave_documento: 'PREVIO',
                i_thumbnail: 0,
                i_imagenes_pdf: 0
            });

            if(digi?.data){
                for(let img of digi.data){
                    await FileSystem.moveAsync({
                        from: `${FileSystem.documentDirectory}${sk_previo}/imagenes_no_subidas/${img.s_nombre_original}`,
                        to: `${FileSystem.documentDirectory}${sk_previo}/imagenes_subidas/${img.s_nombre_original}`,
                    });
                }
            }
            contarImagenes(); 
            console.log(imagenes_subidas);
            
        } catch (error) {
            console.log("error:,",error);
        }
    }

    const api_procesarArchivosDigitalizacion = async (sk_codigo, files, datos)  => {
        try {
            const formFile = new FormData();
            const sYear = new Date().getFullYear();
            const sMes = new Date().getMonth() + 1;
            formFile.append("s_clave_expediente", datos.s_clave_expediente);
            formFile.append("s_clave_documento", datos.s_clave_documento);
            formFile.append("sk_codigo", sk_codigo);
            formFile.append("i_thumbnail", datos.i_thumbnail);
            formFile.append("i_imagenes_pdf", datos.i_imagenes_pdf);
            formFile.append("sYear", sYear);
            formFile.append("sMes", sMes);
            formFile.append("location", `expedientes/${datos.s_clave_expediente}/${sYear}/${sMes}/${sk_codigo}/`);
            
            let i = 0;
            for (const file of files) {
                const filename = file.uri.split('/').pop();
                const fileType = file.uri.split('.').pop();

                formFile.append('files', {
                    uri: file.uri,
                    name: filename,
                    type: `image/${fileType}`,
                });
                
            } 
            
            const rutas = await Util_apiForm('/api/digitalizacion_app', 'POST', formFile);
            return await rutas.json();
        } catch (error) {
        }    
    }

    useFocusEffect(
        useCallback(() => {
            obtenerDatos();
        }, [])
    );

    return (
        <>
            <View>
                <View style={{ height: '20%', backgroundColor: 'gray' }}></View>
                <ScrollView style={{ paddingHorizontal: 15, marginBottom: 15, marginTop: -50, height: '85%' }}>
                    <Card>
                        <Card.Content>
                            <Text variant="titleLarge" style={{ color: 'red', paddingBottom: 10 }}>{previo?.i_folio}</Text>
                            <Text numberOfLines={1} variant="bodyMedium">{previo?.s_nombre_cliente}</Text>
                            <Text numberOfLines={1} variant="bodyMedium">{previo?.empresa_terminal}</Text>
                            <Divider style={{ marginVertical: 5 }}></Divider>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 0 }}>
                                <View>
                                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>Tipo de carga</Text>
                                    <Text variant="bodyMedium">{previo?.nombre_tipo_carga}</Text>
                                </View>

                                <View></View>

                                <View>
                                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>Bultos</Text>
                                    <Text variant="bodyMedium" style={{ textAlign: 'center' }}>{previo?.i_bultos}</Text>
                                </View>
                                <View>
                                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>Peso</Text>
                                    <Text variant="bodyMedium" style={{ textAlign: 'center' }}>{previo?.f_peso}</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 0 }}>
                                <View>
                                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>Fecha y Hora Confirmación</Text>
                                    <Text variant="bodyMedium">{Util_dateFormat(previo?.d_fecha_confirmacion) + ' - ' + previo?.t_hora_confirmacion}</Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => bottomSheetRef.current?.expand()} style={{ height: 40, width: 40, position: 'absolute', top: 3, right: 6, marginTop: 0 }}>
                                <Avatar.Icon style={{ borderRadius: 10 }} color='white' size={44} icon="camera" />
                            </TouchableOpacity>


                        </Card.Content>
                    </Card>

                    <View style={{ marginTop: 15, flexDirection: 'row', gap: 5 }}>
                        <Chip mode='outlined' onPress={() => console.log('Pressed')}>Modelos</Chip>
                        <Chip mode='outlined' onPress={() => console.log('Pressed')}>Comentarios</Chip>
                        <Chip mode='outlined' onPress={() => navigation.navigate('Prueba')}>Sellos Finales</Chip>
                    </View>

                    <Card style={{ width: '100%', marginTop: 15 }}>
                        <Card.Content>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>Reconocedores</Text><Text> ({previo?.reconocedores.length || 0})</Text>
                            </View>
                            <Divider style={{ marginVertical: 5 }}></Divider>
                            <View style={{ height: 60 }}>
                                <ScrollView>
                                    {
                                        previo?.reconocedores.map((reconocedores, index) => {

                                            return (
                                                <Text key={index}>{reconocedores?.nombre_reconocedor}</Text>
                                            )
                                        })
                                    }
                                </ScrollView>
                            </View>
                        </Card.Content>
                    </Card>

                    <View style={{ flexDirection: 'row', gap: 13, marginTop: 15 }}>
                        <Card style={{ width: '48%' }}>
                            <Card.Content>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>Contenedor</Text><Text> ({previo?.contenedores.length || 0})</Text>
                                </View>
                                <Divider style={{ marginVertical: 5 }}></Divider>
                                <View style={{ height: 60 }}>
                                    <ScrollView>
                                        {
                                            previo?.contenedores.map((contenedor, index) => {

                                                return (
                                                    <Text key={index}>{contenedor?.s_numero_contenedor}</Text>
                                                )
                                            })
                                        }
                                    </ScrollView>
                                </View>
                            </Card.Content>
                        </Card>


                        {
                            !previo?.s_guias
                                ? <Card style={{ width: '48%' }}>
                                    <Card.Content>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>BL'S</Text><Text> (3)</Text>
                                        </View>
                                        <Divider style={{ marginVertical: 5 }}></Divider>
                                        <View style={{ height: 60 }}>
                                            <ScrollView>
                                                <Text>GUÍA-001</Text>
                                                <Text>GUÍA-002</Text>
                                                <Text>GUÍA-003</Text>
                                            </ScrollView>
                                        </View>
                                    </Card.Content>
                                </Card>
                                : <Card style={{ width: '48%' }}>
                                    <Card.Content>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>Guías</Text>
                                        </View>
                                        <Divider style={{ marginVertical: 5 }}></Divider>
                                        <View style={{ height: 60 }}>
                                            <ScrollView>
                                                <Text>{previo?.s_guias}</Text>
                                            </ScrollView>
                                        </View>
                                    </Card.Content>
                                </Card>
                        }

                    </View>

                    <View style={{ flexDirection: 'row', gap: 13, marginVertical: 15 }}>
                        <Card style={{ width: '48%' }}>
                            <Card.Content>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>Modelos</Text><Text> ({previo?.modelos.length})</Text>
                                </View>
                                <Divider style={{ marginVertical: 5 }}></Divider>
                                <View style={{ height: 60 }}>
                                    <ScrollView>
                                        {
                                            previo?.modelos.map((modelo, index) => {
                                                return (
                                                    <Text key={index}>{modelo?.s_modelo}</Text>
                                                )
                                            })
                                        }
                                    </ScrollView>
                                </View>
                            </Card.Content>
                        </Card>


                        <Card style={{ width: '48%' }}>
                            <Card.Content>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text variant="bodyLarge" style={{ fontWeight: 'bold' }}>Autoridades</Text><Text> ({previo?.autoridades.length})</Text>
                                </View>
                                <Divider style={{ marginVertical: 5 }}></Divider>
                                <View style={{ height: 60 }}>
                                    <ScrollView>
                                        {
                                            previo?.autoridades.map((autoridad, index) => {
                                                return (
                                                    <Text key={index}>{autoridad?.nombre_autoridad}</Text>
                                                )
                                            })
                                        }
                                    </ScrollView>
                                </View>
                            </Card.Content>
                        </Card>
                    </View>

                </ScrollView>
            </View>

            <BottomSheet
                ref={bottomSheetRef}
                index={0}
                snapPoints={[1, '95%']}
            >
                <BottomSheetView style={{
                    flex: 1,
                    backgroundColor: ColorPrimary.secundary
                }}>
                    <ScrollView>
                        {/* FORMULARIO */}

                        <View style={{ paddingTop: 10, flexDirection: 'row', gap: 13, padding: 6 }}>
                            <View style={{ width: '80%' }}>
                                <Text style={{ fontWeight: 'bold' }}>Contenedor</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: '100%' }}>
                                        <Select
                                            data={contenedor}
                                            value={contenedor.find(val => val.value === formContenedor?.value)}
                                            onChange={setFormContenero}
                                        ></Select>
                                    </View>

                                    {/* Camara */}
                                    <View style={{ alignItems: 'center' }}>
                                        <IconButton
                                            style={{ borderRadius: 10 }}
                                            mode='outlined'
                                            icon="camera-plus"
                                            size={34}
                                            onPress={abrirCamara}
                                        />
                                    </View>
                                </View>

                                <Text style={{ fontWeight: 'bold' }}>Modelo</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ width: '100%' }}>
                                        <Select
                                            data={arrayModelos}
                                            value={arrayModelos.find(val => val.value === formModelo?.value)}
                                            onChange={setFormModelo}
                                        ></Select>
                                    </View>

                                    {/* Camara */}
                                    <View style={{ alignItems: 'center' }}>
                                        <IconButton
                                            style={{ borderRadius: 10 }}
                                            iconColor= 'green'
                                            mode='outlined'
                                            icon="cloud-upload"
                                            size={34}
                                            onPress={subirFotos}
                                            disabled={ imagenes_no_subidas?.length === 0 ? true : false}
                                        />
                                    </View>
                                </View>
                                

                            </View>
                        </View>

                        <Divider style={{ marginVertical: 5 }}></Divider>

                        {/* VISOR DE IMAGENES */}
                        <View style={{ paddingHorizontal: 10 }}>
                            <View>

                                {/* Imagenes subidas */}
                                <Text style={{ fontSize: 20, textAlign: 'center' }} >Imagenes subidas</Text>
                                <View style={{ flexDirection: 'column' }}>
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                        {
                                            imagenes_subidas.map((imagen, index) => {
                                                return (
                                                    <View key={index}>
                                                        {
                                                            index <= 11 &&
                                                            <Pressable key={index} onPress={() => {
                                                                setUriImg(imagen)
                                                                setModalVisible(true)
                                                            }}>
                                                                <Image
                                                                    source={imagen}
                                                                    style={{ borderRadius: 5, width: 88, height: 80 }}
                                                                    contentFit="cover"
                                                                    transition={1000}
                                                                />
                                                            </Pressable>

                                                        }

                                                    </View>
                                                )
                                            })
                                        }
                                    </View>
                                </View>

                                {/* Imagenes no subidas */}
                                <Text style={{ fontSize: 20, textAlign: 'center' }} >Imagenes no subidas</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                                    {
                                        imagenes_no_subidas.map((imagen, index) => {
                                            return (
                                                <View key={index}>
                                                    {
                                                        index <= 7 &&
                                                        <Pressable key={index} onPress={() => {
                                                            setUriImg(imagen)
                                                            setModalVisible(true)
                                                        }}>
                                                            <Image
                                                                source={imagen}
                                                                style={{ borderRadius: 5, width: 88, height: 80 }}
                                                                contentFit="cover"
                                                                transition={1000}
                                                            />
                                                        </Pressable>

                                                    }

                                                </View>
                                            )
                                        })
                                    }
                                </View>

                            </View>
                        </View>

                    </ScrollView>
                    <Button onPress={() => bottomSheetRef.current?.close()} mode='contained' style={{ backgroundColor: 'white', borderRadius: 0 }}>
                        <Text style={{ color: colorPrimary.color }}>CERRAR</Text>
                    </Button>
                </BottomSheetView>
            </BottomSheet >

            <Portal>
                <Dialog visible={isModalVisible} onDismiss={() => setModalVisible(false)}>
                    {/* Tabla de licencias */}
                    <Dialog.Content>
                        <Image
                            source={uriImg}
                            style={{ borderRadius: 10, width: '100%', height: 500, backgroundColor: 'blue' }}
                            contentFit="cover"
                            transition={1000}
                        />
                    </Dialog.Content>

                    <Dialog.Actions>
                        <Button onPress={() => setModalVisible(false)}>Cerrar</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </>
    )
}
