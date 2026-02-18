import {
  ScrollView,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from "react-native";
import {
  Text,
  Divider,
  IconButton,
  RadioButton,
  Portal,
  Dialog,
  Button,
  Card,
  FAB,
  Icon,
  ActivityIndicator,
} from "react-native-paper";
import { Image } from "expo-image";
import Select from "../components/Select";

import InputArea from "../components/InputArea";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";

/* ===================== */
const arrayTipoFoto = [
  { label: "Apertura", value: "APERTU" },
  { label: "General", value: "GENERA" },
  { label: "Cierre", value: "CIERRE" },
];

const arrayTipoDano = [
  { label: "Abollado", value: "ABOLLAD" },
  { label: "Golpeado", value: "GOLPEAD" },
];

/* IMÁGENES */
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import Input from "../components/Input";
import { Util_apiForm, Util_apiServices } from "../utils/Util_apiServices";
import { showMessage } from "react-native-flash-message";

export default function Fotografias({ navigation }) {
  const route = useRoute();
  const {
    previo_data: previo,
    sk_estatus_reconocedor,
    sk_previo,
  } = route.params;

  const [selectTipoFoto, setSelectTipoFoto] = useState(null);
  const [nuevoParte, setNuevoParte] = useState(null);
  const [selectParte, setSelectParte] = useState(null);
  const [selectDano, setSelectDano] = useState(null);
  const [selectContenedor, setSelectContenedor] = useState(null);
  const [inputObservaciones, setInputObservaciones] = useState(null);

  const [menu, setMenu] = useState(false);
  const [flotante, setFlotante] = useState(false);

  const [estado_mercancia, set_estado_mercancia] = useState("sin_dano");
  const [nuevo_parte, set_nuevo_parte] = useState(false);

  const [imagenes_subidas, set_imagenes_subidas] = useState([]);
  const [imagenes_no_subidas, set_imagenes_no_subidas] = useState([]);
  const [subirImagenes, setSubirImagenes] = useState(false);
  const [loading_subiendo_fotos, set_loading_subiendo_fotos] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [uriImg, setUriImg] = useState(null);
  const [permisoEliminarFoto, setPermisoEliminarFoto] = useState(false);

  const basePath = `${FileSystem.documentDirectory}${sk_previo}`;

  /* ===================== */
  useEffect(() => {
    if (sk_estatus_reconocedor === "FI") {
      navigation.setOptions({
        headerStyle: { backgroundColor: "#22c55e" },
      });
      StatusBar.setBackgroundColor("#22c55e");
    }
    prepararDirectorios();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          if (menu) {
            setMenu(false);
            return true; // ⛔ evita la navegación
          }
          return false; // ✅ permite el back normal
        },
      );

      return () => subscription.remove();
    }, [menu]),
  );

  useFocusEffect(
    useCallback(() => {
      setFlotante(true);
    }, []),
  );

  /* ===================== */
  const prepararDirectorios = async () => {
    await FileSystem.makeDirectoryAsync(`${basePath}/imagenes_subidas`, {
      intermediates: true,
    });
    await FileSystem.makeDirectoryAsync(`${basePath}/imagenes_no_subidas`, {
      intermediates: true,
    });
    mostrarImagenes();
  };

  /* ===================== */

  const guardarImagen = async (uri) => {
    try {
      const permiso = await MediaLibrary.requestPermissionsAsync();
      if (permiso.status === "granted") {
        await MediaLibrary.saveToLibraryAsync(uri);
      }
    } catch (error) {
      console.log("Error guardarImagen:", error);
    }
  };

  const abrirCamara = async () => {
    try {
      const permiso = await ImagePicker.requestCameraPermissionsAsync();
      if (!permiso.granted) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      const nombre = uri.split("/").pop();

      await asegurarCarpetas();
      await guardarImagen(uri);

      await FileSystem.moveAsync({
        from: uri,
        to: `${basePath}/imagenes_no_subidas/${nombre}`,
      });

      await mostrarImagenes();

      //Volver a abrir la camara
      abrirCamara();
    } catch (error) {
      console.log("Error cámara:", error);
    }
  };

  const abrirGaleria = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert(
          "Permiso requerido",
          "Necesitas permitir acceso a la galería",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true, // 👈 puedes quitarlo si solo quieres una
        quality: 0.7,
      });

      if (result.canceled) return;

      await asegurarCarpetas();

      for (const asset of result.assets) {
        const uri = asset.uri;
        const nombre = uri.split("/").pop();

        const destino = `${basePath}/imagenes_no_subidas/${nombre}`;

        await FileSystem.copyAsync({
          from: uri,
          to: destino,
        });
      }

      await mostrarImagenes();
    } catch (error) {
      console.log("Error galería:", error);
    }
  };

  /* ============NUEVOOO========= */

  const asegurarCarpetas = async () => {
    const subidas = `${basePath}/imagenes_subidas`;
    const noSubidas = `${basePath}/imagenes_no_subidas`;

    const infoSubidas = await FileSystem.getInfoAsync(subidas);
    const infoNoSubidas = await FileSystem.getInfoAsync(noSubidas);

    if (!infoSubidas.exists) {
      await FileSystem.makeDirectoryAsync(subidas, { intermediates: true });
    }

    if (!infoNoSubidas.exists) {
      await FileSystem.makeDirectoryAsync(noSubidas, { intermediates: true });
    }
  };

  const mostrarImagenes = async () => {
    try {
      await asegurarCarpetas();

      const subidasPath = `${basePath}/imagenes_subidas`;
      const noSubidasPath = `${basePath}/imagenes_no_subidas`;

      const subidasFiles = await FileSystem.readDirectoryAsync(subidasPath);
      const noSubidasFiles = await FileSystem.readDirectoryAsync(noSubidasPath);

      set_imagenes_subidas(
        subidasFiles.map((f) => ({
          uri: `file://${subidasPath}/${f}`,
        })),
      );

      set_imagenes_no_subidas(
        noSubidasFiles.map((f) => ({
          uri: `file://${noSubidasPath}/${f}`,
        })),
      );

      //setTotalSubidas(subidasFiles.length);
      //setTotalNoSubidas(noSubidasFiles.length);
    } catch (error) {
      console.log("mostrarImagenes error:", error);
    }
  };

  /* ===================== */
  const subirFotos = async () => {
    try {
      set_loading_subiendo_fotos(true);
      setSubirImagenes(true);
      if (imagenes_no_subidas.length === 0) {
        alert("No se encontraron archivos.");
        return false;
      }

      const digi = await api_procesarArchivosDigitalizacion(
        sk_previo,
        imagenes_no_subidas,
        {
          s_clave_expediente: "PREVIO",
          s_clave_documento: "PREVIO",
          i_thumbnail: 1,
          i_imagenes_pdf: 0,
        },
      );

      if (digi) {
        const documentos = [];

        for (let img of digi.data) {
          documentos.push(img.sk_documento_digitalizacion);
          await FileSystem.moveAsync({
            from: `${FileSystem.documentDirectory}${sk_previo}/imagenes_no_subidas/${img.s_nombre_original}`,
            to: `${FileSystem.documentDirectory}${sk_previo}/imagenes_subidas/${img.s_nombre_original}`,
          });
        }

        const res_guardar = await Util_apiServices(
          "/api/agen/traf/prev-foto/api-previos/app_guardar",
          "POST",
          {
            documentos,
            sk_previo,
            s_nuevo_modelo: nuevoParte,
            sk_previo_modelo: selectParte?.value,
            s_observaciones: inputObservaciones,
            s_estado_mercancia: selectDano?.value,
            sk_previo_contenedor: selectContenedor?.value,
            sk_tipo_foto: selectTipoFoto?.value,
            sk_dano: null,
          },
        );

        /* Notificación de subida correctamente */
        showMessage({
          message: "Notificación",
          description: "Las fotografías se subieron correctamente.",
          type: "success",
        });

        /* Limpiar los datos */
        set_estado_mercancia("sin_dano");
        setSelectDano(null);
        setSelectTipoFoto(null);
        setNuevoParte(null);
        setSelectParte(null);
        setSelectContenedor(null);
        setInputObservaciones(null);

        set_loading_subiendo_fotos(false);
      }

      mostrarImagenes();
      setSubirImagenes(false);
    } catch (error) {
      setSubirImagenes(false);
      console.log("error:,", error);
    }
  };

  /* ===================== */
  const api_procesarArchivosDigitalizacion = async (
    sk_codigo,
    files,
    datos,
  ) => {
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
      formFile.append(
        "location",
        `expedientes/${datos.s_clave_expediente}/${sYear}/${sMes}/${sk_codigo}/`,
      );

      let i = 0;
      for (const file of files) {
        const filename = file.uri.split("/").pop();
        const fileType = file.uri.split(".").pop();

        formFile.append("files", {
          uri: file.uri,
          name: filename,
          type: `image/${fileType}`,
        });
      }

      const rutas = await Util_apiForm("/api/digitalizacion", "POST", formFile);

      return await rutas.json();
    } catch (error) {}
  };

  /* ===================== */
  const eliminarFoto = async (img) => {
    try {
      if (!img?.uri) return;

      // quitar file:// para legacy FS
      const ruta = img.uri.replace("file://", "");

      const info = await FileSystem.getInfoAsync(ruta);
      if (!info.exists) {
        console.log("Archivo no existe:", ruta);
        return;
      }

      await FileSystem.deleteAsync(ruta, { idempotent: true });

      setModalVisible(false);
      setUriImg(null);
      mostrarImagenes();
    } catch (error) {
      console.log("Error al eliminar foto:", error);
    }
  };

  return (
    <>
      <Card
        style={{
          margin: 10,
          flexDirection: "row",
          backgroundColor: "white",
        }}
      >
        <Card.Content>
          <View>
            <Text
              variant="titleLarge"
              style={{
                color: "red",
                marginVertical: 5,
                borderBottomWidth: 1,
                borderColor: "lightgray",
              }}
            >
              {previo?.i_folio}
            </Text>

            <View>
              <Text style={{ fontWeight: "bold" }}>Estado de la mercancía</Text>

              <RadioButton.Group
                onValueChange={set_estado_mercancia}
                value={estado_mercancia}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginRight: 16,
                    }}
                  >
                    <RadioButton color="green" value="sin_dano" />
                    <Text>Sin Daño</Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <RadioButton color="red" value="con_dano" />
                    <Text>Con Daño</Text>
                  </View>
                </View>
              </RadioButton.Group>
            </View>

            {estado_mercancia === "con_dano" && (
              <View>
                <Text style={{ fontWeight: "bold" }}>Tipo de daño</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 5,
                  }}
                >
                  <View style={{ width: "100%" }}>
                    <Select
                      data={arrayTipoDano}
                      value={arrayTipoDano.find(
                        (val) => val.value === selectDano?.value,
                      )}
                      onChange={setSelectDano}
                    ></Select>
                  </View>
                </View>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 5,
              }}
            >
              <View style={{ width: "40%" }}>
                <Text style={{ fontWeight: "bold" }}>Tipo de foto</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: "100%" }}>
                    <Select
                      data={arrayTipoFoto}
                      value={arrayTipoFoto.find(
                        (val) => val.value === selectTipoFoto?.value,
                      )}
                      onChange={setSelectTipoFoto}
                    ></Select>
                  </View>
                </View>
              </View>

              {!nuevo_parte ? (
                <View style={{ width: "48%" }}>
                  <Text style={{ fontWeight: "bold" }}>Número de parte</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: "100%" }}>
                      <Select
                        data={previo?.select_modelos}
                        value={previo?.select_modelos.find(
                          (val) => val.value === selectParte?.value,
                        )}
                        onChange={setSelectParte}
                      ></Select>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={{ width: "48%" }}>
                  <Text style={{ fontWeight: "bold" }}>Nuevo Número</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: "100%" }}>
                      <Input
                        placeholder="Nuevo Número"
                        value={nuevoParte}
                        onChangeText={(text) => setNuevoParte(text)}
                      />
                    </View>
                  </View>
                </View>
              )}

              <View
                style={{
                  width: "12%",
                }}
              >
                <View
                  style={{
                    marginTop: 19.5,
                    backgroundColor: nuevo_parte ? "#FF7070" : "#6CA651",
                    borderColor: "#25671E",
                    borderWidth: 1,
                    borderRadius: 6,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconButton
                    icon={nuevo_parte ? "close" : "plus"}
                    iconColor={"white"}
                    size={20}
                    onPress={() => {
                      setNuevoParte(null);
                      setSelectParte(null);
                      set_nuevo_parte((prev) => !prev);
                    }}
                  />
                </View>
              </View>
            </View>

            {previo?.sk_tipo_carga === "CONT" && (
              <View style={{ marginTop: 5 }}>
                <Text style={{ fontWeight: "bold" }}>Contenedores</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: "100%" }}>
                    <Select
                      data={previo?.select_contenedores}
                      value={previo?.select_contenedores.find(
                        (val) => val.value === selectContenedor?.value,
                      )}
                      onChange={setSelectContenedor}
                    ></Select>
                  </View>
                </View>
              </View>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 5,
              }}
            >
              <View style={{ width: "100%" }}>
                <Text style={{ fontWeight: "bold", marginVertical: 5 }}>
                  Observaciones
                </Text>
                <Input
                  placeholder="Observaciones"
                  value={inputObservaciones}
                  onChangeText={(text) => setInputObservaciones(text)}
                />
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <Divider style={{ marginVertical: 5 }} />

          <View>
            {loading_subiendo_fotos ? (
              <View style={{ marginTop: 10 }}>
                <ActivityIndicator size={40} animating={true} color={"green"} />
                <Text
                  style={{
                    textAlign: "center",
                    paddingTop: 20,
                    color: "gray",
                  }}
                >
                  Subiendo Fotografias
                </Text>
              </View>
            ) : (
              <View>
                {/* ================= IMÁGENES SUBIDAS ================= */}
                <View style={{ paddingHorizontal: 10 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      textAlign: "left",
                      fontWeight: "lighter",
                      color: "gray",
                      borderBottomWidth: 1,
                      borderBottomColor: "lightgray",
                      marginBottom: 5,
                    }}
                  >
                    IMAGENES SUBIDAS
                  </Text>

                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}
                  >
                    {imagenes_subidas.map((imagen, index) => (
                      <Pressable
                        key={index}
                        onPress={() => {
                          setPermisoEliminarFoto(false);
                          setUriImg(imagen);
                          setModalVisible(true);
                        }}
                      >
                        <Image
                          transition={1000}
                          source={imagen}
                          style={{ borderRadius: 5, width: 88, height: 80 }}
                          contentFit="cover"
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* ================= IMÁGENES NO SUBIDAS ================= */}
                <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      textAlign: "left",
                      fontWeight: "lighter",
                      color: "gray",
                      borderBottomWidth: 1,
                      borderBottomColor: "lightgray",
                      marginBottom: 5,
                    }}
                  >
                    IMAGENES NO SUBIDAS
                  </Text>

                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}
                  >
                    {imagenes_no_subidas.map((imagen, index) => (
                      <Pressable
                        key={index}
                        onPress={() => {
                          setPermisoEliminarFoto(true);
                          setUriImg(imagen);
                          setModalVisible(true);
                        }}
                      >
                        <Image
                          source={imagen}
                          style={{ borderRadius: 5, width: 88, height: 80 }}
                          contentFit="cover"
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ================= MODAL ================= */}
      <Portal>
        <Dialog
          visible={isModalVisible}
          onDismiss={() => setModalVisible(false)}
        >
          <Dialog.Content>
            <Image
              source={uriImg}
              style={{
                borderRadius: 10,
                width: "100%",
                height: 250,
              }}
            />
          </Dialog.Content>

          <Dialog.Actions>
            {permisoEliminarFoto && (
              <Button onPress={() => eliminarFoto(uriImg)}>Eliminar</Button>
            )}
            <Button onPress={() => setModalVisible(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {sk_estatus_reconocedor !== "FI" && (
        <Portal>
          <FAB.Group
            fabStyle={{ backgroundColor: menu ? "#d12812" : "#3291B6" }}
            color="white"
            containerStyle={{ backgroundColor: "blue" }}
            open={menu}
            visible={flotante}
            icon={menu ? "close" : "camera-plus-outline"}
            actions={[
              {
                visible: true,
                icon: "camera-plus",
                color: "#BB8ED0",
                label: "Abrir Camara",
                labelTextColor: "#827C7C",
                onPress: () => {
                  abrirCamara();
                  setMenu(true);
                },
              },
              {
                visible: true,
                icon: "image-search",
                color: "#00B7B5",
                label: "Abrir Galería",
                labelTextColor: "#827C7C",
                onPress: () => {
                  abrirGaleria();
                  setMenu(true);
                },
              },
              {
                visible: true,
                icon: "cloud-upload",
                color:
                  imagenes_no_subidas.length > 0 && !loading_subiendo_fotos
                    ? "#8BAE66"
                    : "#7c767646",
                label: "Subir Fotografías",
                labelTextColor:
                  imagenes_no_subidas.length > 0 && !loading_subiendo_fotos
                    ? "#827C7C"
                    : "#7c767646",
                onPress: () => {
                  if (
                    imagenes_no_subidas.length === 0 ||
                    loading_subiendo_fotos
                  ) {
                    setMenu(false);
                    return false;
                  } else {
                    subirFotos();
                    setMenu(true);
                  }
                },
              },
            ]}
            onStateChange={() => setMenu((prev) => !prev)}
            onPress={() => {
              if (menu) {
                // callback al cerrar el menu
                //setMenu(prev => !prev)
              }
            }}
          />
        </Portal>
      )}
    </>
  );
}
