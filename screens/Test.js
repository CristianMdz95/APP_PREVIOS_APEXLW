import React, { useState, useEffect } from 'react';
import { View, Button, Image, Text, StyleSheet, FlatList, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

export default function Test() {
    const [image, setImage] = useState(null);
    const [numImagesSubidas, setNumImagesSubidas] = useState(0);
    const [numImagesNoSubidas, setNumImagesNoSubidas] = useState(0);
    const [imagenes_subidas, set_imagenes_subidas] = useState([]);
    const [imagenes_no_subidas, set_imagenes_no_subidas] = useState([]);

    useEffect(() => {
        countImages();
    }, []);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                //allowsEditing: true,
                //aspect: [4, 3],
                quality: 1,
            });

            if (!result.cancelled) {
                //setImage(result.assets[0].uri);
                await saveImage(result.assets[0].uri);
                await createCustomFolders(result.assets[0].uri);
                countImages();
            }

        } catch (error) {
            console.log('Error al seleccionar la imagen:', error);
        }
    };

    const takePhotoFromCamera = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                //allowsEditing: true,
                //aspect: [4, 3],
                quality: 1,
            });

            console.log(result)
            if (result.assets[0].uri) {
                //setImage(result.assets[0].uri);
                await saveImage(result.assets[0].uri);
                await createCustomFolders(result.assets[0].uri);
                countImages();
                //Volver a abrir la camara
                takePhotoFromCamera();
            }

        } catch (error) {
            console.log('Error al tomar la foto:', error);
        }
    };

    const saveImage = async (uri) => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted') {
                await MediaLibrary.saveToLibraryAsync(uri);
                console.log('Imagen guardada exitosamente en la biblioteca de medios');
            }
        } catch (error) {
            console.log('Error al guardar la imagen:', error);
        }
    };

    const createCustomFolders = async (imageUri) => {
        try {
            const subidasFolderName = 'imagenes_subidas';
            const noSubidasFolderName = 'imagenes_no_subidas';
            const subidasFolderUri = FileSystem.documentDirectory + subidasFolderName;
            const noSubidasFolderUri = FileSystem.documentDirectory + noSubidasFolderName;

            // Crear carpetas si no existen
            await FileSystem.makeDirectoryAsync(subidasFolderUri, { intermediates: true });
            await FileSystem.makeDirectoryAsync(noSubidasFolderUri, { intermediates: true });

            // Obtener el nombre de la imagen
            const nombreImagen = imageUri.split('/').pop();

            // Mover la imagen a la carpeta correspondiente
            const folderToMove = isImageUploaded(imageUri) ? subidasFolderUri : noSubidasFolderUri;
            await FileSystem.moveAsync({
                from: imageUri,
                to: folderToMove + '/' + nombreImagen,
            });

            console.log('Imagen movida a la carpeta correspondiente');
        } catch (error) {
            console.log('Error al crear las carpetas personalizadas:', error);
        }
    };

    const isImageUploaded = (imageUri) => {
        return false;
    };

    const countImages = async () => {
        try {
            const subidasFolderName = 'imagenes_subidas';
            const noSubidasFolderName = 'imagenes_no_subidas';
            const subidasFolderUri = FileSystem.documentDirectory + subidasFolderName;
            const noSubidasFolderUri = FileSystem.documentDirectory + noSubidasFolderName;

            const subidasFiles = await FileSystem.readDirectoryAsync(subidasFolderUri);
            const noSubidasFiles = await FileSystem.readDirectoryAsync(noSubidasFolderUri);

            setNumImagesSubidas(subidasFiles.length);
            setNumImagesNoSubidas(noSubidasFiles.length);
            set_imagenes_subidas(subidasFiles.map(filename => ({ uri: `${subidasFolderUri}/${filename}` })));
            set_imagenes_no_subidas(noSubidasFiles.map(filename => ({ uri: `${noSubidasFolderUri}/${filename}` })));
        } catch (error) {
            console.log('Error al contar las imágenes:', error);
        }
    };

    const handleSyncImages = async () => {
        try {
            const noSubidasFolderName = 'imagenes_no_subidas';
            const noSubidasFolderUri = FileSystem.documentDirectory + noSubidasFolderName;

            const noSubidasFiles = await FileSystem.readDirectoryAsync(noSubidasFolderUri);

            for (const filename of noSubidasFiles) {
                const imageUri = `${noSubidasFolderUri}/${filename}`;
                const uploaded = await processAndUploadImage(imageUri);
                if (uploaded) {
                    // Si la imagen se subió correctamente, la movemos a la carpeta de imágenes subidas
                    await FileSystem.moveAsync({
                        from: imageUri,
                        to: `${FileSystem.documentDirectory}imagenes_subidas/${filename}`,
                    });
                }
            }

            // Volver a contar las imágenes después de la sincronización
            countImages();
        } catch (error) {
            console.log('Error al sincronizar las imágenes:', error);
        }
    };

    const processAndUploadImage = async (imageUri) => {
        // Aquí debes implementar la lógica para procesar y subir la imagen
        // Retorna true si la imagen se subió exitosamente, false de lo contrario
        return true; // Por ahora, siempre retornamos true para la demostración
    };

    const handleDeleteSubidas = async () => {
        try {
            const subidasFolderName = 'imagenes_subidas';
            const subidasFolderUri = FileSystem.documentDirectory + subidasFolderName;

            const subidasFiles = await FileSystem.readDirectoryAsync(subidasFolderUri);

            for (const filename of subidasFiles) {
                await FileSystem.deleteAsync(`${subidasFolderUri}/${filename}`, { idempotent: true });
            }

            // Volver a contar las imágenes después de eliminarlas
            countImages();
        } catch (error) {
            console.log('Error al eliminar las imágenes subidas:', error);
        }
    };

    const handleDeleteNoSubidas = async () => {
        try {
            const noSubidasFolderName = 'imagenes_no_subidas';
            const noSubidasFolderUri = FileSystem.documentDirectory + noSubidasFolderName;

            const noSubidasFiles = await FileSystem.readDirectoryAsync(noSubidasFolderUri);

            for (const filename of noSubidasFiles) {
                await FileSystem.deleteAsync(`${noSubidasFolderUri}/${filename}`, { idempotent: true });
            }

            // Volver a contar las imágenes después de eliminarlas
            countImages();
        } catch (error) {
            console.log('Error al eliminar las imágenes no subidas:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.innerContainer}>
                <View style={{ paddingTop: 30, flexDirection: 'column', gap: 10 }}>
                    <Button color='green' title="Tomar foto" onPress={takePhotoFromCamera} />
                    <Button title="Seleccionar imagen de la galería" onPress={pickImage} />
                    <Button color={'orange'} title="Sincronizar imágenes" onPress={handleSyncImages} />
                </View>

                {/*  {image && <Image source={{ uri: image }} style={styles.image} />} */}

                <View style={{ paddingTop: 30 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 20 }}>Imágenes subidas: <Text style={{ fontWeight: 'bold' }}>{numImagesSubidas}</Text></Text>
                        <Button color='red' title="X" onPress={handleDeleteSubidas} />
                    </View>
                    <FlatList
                        horizontal
                        data={imagenes_subidas}
                        renderItem={({ item }) => <Image source={item} style={styles.imageList} />}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>

                <View style={{ paddingTop: 30 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 20 }}>Imágenes no subidas: <Text style={{ fontWeight: 'bold' }}>{numImagesNoSubidas}</Text></Text>
                        <Button color='red' title="X" onPress={handleDeleteNoSubidas} />
                    </View>
                    <FlatList
                        horizontal
                        data={imagenes_no_subidas}
                        renderItem={({ item }) => <Image source={item} style={styles.imageList} />}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>


            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Ajuste para Android
    },
    innerContainer: {
        padding: 10
    },
    image: {
        width: 200,
        height: 200,
        marginTop: 20,
    },
    imageList: {
        width: 200,
        height: 200,
        marginVertical: 10,
    },
});
