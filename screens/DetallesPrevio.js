import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
  StatusBar,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
} from "react-native";
import {
  Text,
  Card,
  Divider,
  Chip,
  Avatar,
  Button,
  IconButton,
  Portal,
  Dialog,
  RadioButton,
  FAB,
} from "react-native-paper";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import NetInfo from "@react-native-community/netinfo";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import ColorPrimary from "../data/ColorPrimary";
import Select from "../components/Select";
import { Util_apiForm, Util_apiServices } from "../utils/Util_apiServices";
import { Util_dateFormat } from "../utils/Util_dateFormat";

/* IMÁGENES */
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import colorPrimary from "../data/ColorPrimary";
import Input from "../components/Input";
import InputArea from "../components/InputArea";

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

export default function DetallesPrevio({ navigation }) {
  const drawerFotografia = useRef(null);

  const route = useRoute();
  const { sk_previo, sk_estatus_reconocedor } = route.params;

  const [formulario_foto, set_formulario_foto] = useState({
    s_estado_mercancia: "sin_dano",
  });

  const [loading_cargar_datos, set_loading_cargar_datos] = useState(true);
  const [menu, setMenu] = useState(false);
  const [flotante, setFlotante] = useState(true);
  const [previo, setPrevio] = useState(null);
  const [contenedores, setContenedores] = useState([]);
  const [formContenedor, setFormContenero] = useState(null);

  const [selectModelo, setSelectModelo] = useState(null);
  const [selectParte, setSelectParte] = useState(null);
  const [selectDano, setSelectDano] = useState(null);
  const [selectContenedor, setSelectContenedor] = useState(null);
  const [inputObservaciones, setInputObservaciones] = useState(null);

  const [TotalSubidas, setTotalSubidas] = useState(0);

  const [estado_mercancia, set_estado_mercancia] = useState("opcion1");

  const [imagenes_subidas, set_imagenes_subidas] = useState([]);
  const [imagenes_no_subidas, set_imagenes_no_subidas] = useState([]);
  const [subirImagenes, setSubirImagenes] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [uriImg, setUriImg] = useState(null);
  const [permisoEliminarFoto, setPermisoEliminarFoto] = useState(false);

  const basePath = `${FileSystem.documentDirectory}${sk_previo}`;

  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [texto_tab, set_texto_tab] = React.useState("reconocedores");

  const [routes] = React.useState([
    { key: "reconocedores", title: "Reconocedores" },
    { key: "contenedores", title: "Contenedores" },
    { key: "modelos", title: "Modelos" },
    { key: "bl", title: "BL'S" },
    { key: "autoridades", title: "Autoridades" },
  ]);

  const renderScene = SceneMap({
    reconocedores: () => (
      <View style={{ padding: 20 }}>
        <Text>Contenido de Reconocedores</Text>
      </View>
    ),
    contenedores: () => (
      <View style={{ padding: 20 }}>
        <Text>Contenido de Contenedores</Text>
      </View>
    ),
    modelos: () => (
      <View style={{ padding: 20 }}>
        <Text>Contenido de Modelos</Text>
      </View>
    ),
    bl: () => (
      <View style={{ padding: 20 }}>
        <Text>Contenido de Modelos</Text>
      </View>
    ),
    autoridades: () => (
      <View style={{ padding: 20 }}>
        <Text>Contenido de Autoridades</Text>
      </View>
    ),
  });

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

  const normalizarUri = (path) => {
    if (path.startsWith("file://")) return path;
    return `file://${path}`;
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

      setTotalSubidas(subidasFiles.length);
      //setTotalNoSubidas(noSubidasFiles.length);
    } catch (error) {
      console.log("mostrarImagenes error:", error);
    }
  };

  /* ===================== */
  const subirFotos = async () => {
    try {
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

      if (digi?.data) {
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
            s_nuevo_modelo: null,
            s_estado_mercancia: null,
            sk_previo_modelo: null,
          },
        );
        console.log(res_guardar);
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

  /* ===================== */
  useFocusEffect(
    useCallback(() => {
      set_loading_cargar_datos(true);
      Util_apiServices(
        "/api/agen/traf/prev-apli/api-previos/obtenerPrevio",
        "POST",
        { sk_previo },
      ).then((res) => {
        setPrevio(res.data);
        let contenedores = res.data.contenedores.map((contendor) => ({
          label: contendor.s_numero_contenedor,
          value: contendor.s_numero_contenedor,
        }));
        setContenedores(contenedores);
        set_loading_cargar_datos(false);
      });
    }, []),
  );

  /* ===================== */

  useEffect(() => {
    const tabActual = routes[index].key;
    set_texto_tab(tabActual);
  }, [index]);

  const finalizarPrevio = async () => {
    alert("asdasdj");
  };

  console.log("contenedores:", contenedores);
  return (
    <>
      {loading_cargar_datos ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color={ColorPrimary.color} />
        </View>
      ) : (
        <View>
          {sk_estatus_reconocedor === "FI" ? (
            <View style={{ marginBottom: 65 }}></View>
          ) : (
            <View style={{ height: "20%", backgroundColor: "gray" }}>
              <Image
                source={
                  imagenes_no_subidas?.[0]
                    ? imagenes_no_subidas[0]
                    : imagenes_subidas?.[0]
                      ? imagenes_subidas?.[0]
                      : ""
                }
                style={{ borderRadius: 5, width: "100%", height: "100%" }}
                contentFit="cover"
                transition={1000}
              />
            </View>
          )}

          <ScrollView
            style={{
              paddingHorizontal: 15,
              marginBottom: 15,
              marginTop: -50,
              height: sk_estatus_reconocedor === "FI" ? "100%" : "85%",
            }}
          >
            <Card>
              <Card.Content>
                <Text
                  variant="titleLarge"
                  style={{ color: "red", paddingBottom: 10 }}
                >
                  {previo?.i_folio}
                </Text>
                {previo?.sk_estatus_reconocedor === "FsI" ? (
                  <Text
                    numberOfLines={1}
                    style={{ color: "#22c55e", fontWeight: "bold" }}
                    variant="bodyMedium"
                  >
                    Finalizado
                  </Text>
                ) : (
                  <Text
                    numberOfLines={1}
                    style={{ color: "#f59e0b", fontWeight: "bold" }}
                    variant="bodyMedium"
                  >
                    En Proceso
                  </Text>
                )}

                <Text numberOfLines={1} variant="bodyMedium">
                  {previo?.s_nombre_cliente}
                </Text>
                <Text numberOfLines={1} variant="bodyMedium">
                  {previo?.empresa_terminal}
                </Text>
                <Divider style={{ marginVertical: 5 }}></Divider>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingHorizontal: 0,
                  }}
                >
                  <View>
                    <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
                      Tipo de carga
                    </Text>
                    <Text variant="bodyMedium">
                      {previo?.nombre_tipo_carga}
                    </Text>
                  </View>

                  <View></View>

                  <View>
                    <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
                      Bultos
                    </Text>
                    <Text variant="bodyMedium" style={{ textAlign: "center" }}>
                      {previo?.i_bultos}
                    </Text>
                  </View>
                  <View>
                    <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
                      Peso
                    </Text>
                    <Text variant="bodyMedium" style={{ textAlign: "center" }}>
                      {previo?.f_peso}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "column",
                    justifyContent: "space-between",
                    paddingHorizontal: 0,
                  }}
                >
                  <View>
                    <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
                      Fecha Recepción
                    </Text>
                    <Text variant="bodyMedium">
                      {Util_dateFormat(previo?.d_fecha_recepcion)}
                    </Text>
                  </View>

                  <View>
                    <Text variant="bodyMedium" style={{ fontWeight: "bold" }}>
                      Fecha y Hora Confirmación
                    </Text>
                    <Text variant="bodyMedium">
                      {Util_dateFormat(previo?.d_fecha_confirmacion) +
                        " - " +
                        previo?.t_hora_confirmacion}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  disabled={sk_estatus_reconocedor === "FI" ? true : false}
                  onPress={() => {
                    //mostrarImagenes();
                    drawerFotografia.current?.expand();
                  }}
                  style={{
                    height: 40,
                    width: 40,
                    position: "absolute",
                    top: 3,
                    right: 6,
                    marginTop: 0,
                  }}
                >
                  <Avatar.Icon
                    style={{
                      borderRadius: 10,
                      backgroundColor:
                        sk_estatus_reconocedor === "FI"
                          ? "lightgray"
                          : ColorPrimary.color,
                    }}
                    color="white"
                    size={44}
                    icon="camera"
                  />
                </TouchableOpacity>
              </Card.Content>
            </Card>

            <ScrollView
              style={{ marginTop: 15, flexDirection: "row", display: "none" }}
              horizontal
            >
              <Chip mode="outlined" onPress={() => console.log("Pressed")}>
                Modelos
              </Chip>
              <Chip
                style={{ marginLeft: 6 }}
                mode="outlined"
                onPress={() => console.log("Pressed")}
              >
                Comentarios
              </Chip>
              <Chip
                style={{ marginLeft: 6 }}
                mode="outlined"
                onPress={() => navigation.navigate("Prueba")}
              >
                Sellos Finales
              </Chip>
            </ScrollView>

            {/* TABS */}
            <Card style={{ flex: 1, backgroundColor: "white", marginTop: 15 }}>
              <TabView
                style={{
                  backgroundColor: "white",
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  elevation: 0, // Android
                  shadowOpacity: 0, // iOS
                }}
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={(val) => {
                  setIndex(val);
                }}
                initialLayout={{ width: layout.width }}
                renderTabBar={(props) => (
                  <TabBar
                    {...props}
                    scrollEnabled
                    indicatorStyle={{ backgroundColor: colorPrimary.color }}
                    style={{
                      backgroundColor: "white",
                    }}
                    activeColor={colorPrimary.color}
                    inactiveColor="#9CA3AF"
                  />
                )}
              />
            </Card>

            {texto_tab === "reconocedores" && (
              <Card
                style={{
                  borderRadius: 0,
                  borderBottomRightRadius: 10,
                  borderBottomLeftRadius: 10,
                }}
              >
                <Card.Content>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                      Reconocedores
                    </Text>
                    <Text> ({previo?.reconocedores.length || 0})</Text>
                  </View>
                  <Divider style={{ marginVertical: 5 }}></Divider>
                  <View style={{ height: 60 }}>
                    <ScrollView>
                      {previo?.reconocedores.map((reconocedores, index) => {
                        return (
                          <Text key={index}>
                            {reconocedores?.nombre_reconocedor}
                          </Text>
                        );
                      })}
                    </ScrollView>
                  </View>
                </Card.Content>
              </Card>
            )}

            {texto_tab === "contenedores" && (
              <Card
                style={{
                  borderRadius: 0,
                  borderBottomRightRadius: 10,
                  borderBottomLeftRadius: 10,
                }}
              >
                <Card.Content>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                      Contenedor
                    </Text>
                    <Text> ({previo?.contenedores.length || 0})</Text>
                  </View>
                  <Divider style={{ marginVertical: 5 }}></Divider>
                  <View style={{ height: 60 }}>
                    <ScrollView>
                      {previo?.contenedores.map((contenedor, index) => {
                        return (
                          <Text key={index}>
                            {contenedor?.s_numero_contenedor}
                          </Text>
                        );
                      })}
                    </ScrollView>
                  </View>
                </Card.Content>
              </Card>
            )}

            {texto_tab === "bl" &&
              (!previo?.s_guias ? (
                <Card
                  style={{
                    borderRadius: 0,
                    borderBottomRightRadius: 10,
                    borderBottomLeftRadius: 10,
                  }}
                >
                  <Card.Content>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                        BL'S
                      </Text>
                      <Text> (3)</Text>
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
              ) : (
                <Card
                  style={{
                    borderRadius: 0,
                    borderBottomRightRadius: 10,
                    borderBottomLeftRadius: 10,
                  }}
                >
                  <Card.Content>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                        Guías
                      </Text>
                    </View>
                    <Divider style={{ marginVertical: 5 }}></Divider>
                    <View style={{ height: 60 }}>
                      <ScrollView>
                        <Text>{previo?.s_guias}</Text>
                      </ScrollView>
                    </View>
                  </Card.Content>
                </Card>
              ))}

            {texto_tab === "modelos" && (
              <Card
                style={{
                  borderRadius: 0,
                  borderBottomRightRadius: 10,
                  borderBottomLeftRadius: 10,
                }}
              >
                <Card.Content>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                      Modelos
                    </Text>
                    <Text> ({previo?.modelos.length})</Text>
                  </View>
                  <Divider style={{ marginVertical: 5 }}></Divider>
                  <View style={{ height: 60 }}>
                    <ScrollView>
                      {previo?.modelos.map((modelo, index) => {
                        return <Text key={index}>{modelo?.s_modelo}</Text>;
                      })}
                    </ScrollView>
                  </View>
                </Card.Content>
              </Card>
            )}

            {texto_tab === "autoridades" && (
              <Card
                style={{
                  borderRadius: 0,
                  borderBottomRightRadius: 10,
                  borderBottomLeftRadius: 10,
                }}
              >
                <Card.Content>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text variant="bodyLarge" style={{ fontWeight: "bold" }}>
                      Autoridades
                    </Text>
                    <Text> ({previo?.autoridades.length})</Text>
                  </View>
                  <Divider style={{ marginVertical: 5 }}></Divider>
                  <View style={{ height: 60 }}>
                    <ScrollView>
                      {previo?.autoridades.map((autoridad, index) => {
                        return (
                          <Text key={index}>{autoridad?.nombre_autoridad}</Text>
                        );
                      })}
                    </ScrollView>
                  </View>
                </Card.Content>
              </Card>
            )}

            {sk_estatus_reconocedor === "FI" ? (
              <></>
            ) : (
              <View style={{ marginTop: 15, marginBottom: 15 }}>
                {/*                 <TouchableOpacity
                  style={{
                    backgroundColor: "#22c55e",
                    borderRadius: 7,
                    height: 30,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => finalizarPrevio()}
                >
                  <Text style={{ color: "white", fontSize: 16 }}>
                    Finalizar Previos
                  </Text>
                </TouchableOpacity> */}
              </View>
            )}
          </ScrollView>
        </View>
      )}

      <BottomSheet ref={drawerFotografia} index={0} snapPoints={[1, "95%"]}>
        <BottomSheetView
          style={{
            flex: 1,
            backgroundColor: ColorPrimary.secundary,
          }}
        >
          <ScrollView>
            {/* FORMULARIO */}

            <View
              style={{
                paddingTop: 10,
                flexDirection: "row",
                gap: 13,
                padding: 6,
              }}
            >
              <View style={{ width: "80%" }}>
                <View>
                  <Text style={{ fontWeight: "bold" }}>
                    Estado de la mercancía
                  </Text>

                  <RadioButton.Group
                    onValueChange={set_estado_mercancia}
                    value={estado_mercancia}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginRight: 16,
                        }}
                      >
                        <RadioButton
                          status={"checked"}
                          color="green"
                          value="sin_dano"
                        />
                        <Text>Sin Daño</Text>
                      </View>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
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
                            (val) => val.value === selectModelo?.value,
                          )}
                          onChange={setSelectDano}
                        ></Select>
                      </View>
                    </View>
                  </View>
                )}

                <Text style={{ fontWeight: "bold" }}>Tipo de foto</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: "79%" }}>
                    <Select
                      data={arrayTipoFoto}
                      value={arrayTipoFoto.find(
                        (val) => val.value === selectDano?.value,
                      )}
                      onChange={setSelectModelo}
                    ></Select>
                  </View>

                  {/* Camara */}
                  <View style={{ alignItems: "center" }}>
                    <IconButton
                      style={{ borderRadius: 10 }}
                      mode="outlined"
                      icon="camera-plus"
                      size={34}
                      onPress={abrirCamara}
                    />
                  </View>

                  {/* Galeria */}
                  <View style={{ alignItems: "center" }}>
                    <IconButton
                      style={{ borderRadius: 10 }}
                      mode="outlined"
                      icon="image-search"
                      size={34}
                      onPress={abrirGaleria}
                    />
                  </View>
                </View>

                <Text style={{ fontWeight: "bold" }}>Número de parte</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: "100%" }}>
                    <Select
                      data={arrayTipoFoto}
                      value={arrayTipoFoto.find(
                        (val) => val.value === selectParte?.value,
                      )}
                      onChange={setSelectParte}
                    ></Select>
                  </View>

                  {/* Camara */}
                  <View style={{ alignItems: "center" }}>
                    <IconButton
                      style={{ borderRadius: 10 }}
                      iconColor="green"
                      mode="outlined"
                      icon="cloud-upload"
                      size={34}
                      loading={subirImagenes}
                      onPress={() => {
                        subirFotos();
                      }}
                      disabled={
                        imagenes_no_subidas?.length === 0 ? true : false
                      }
                    />
                  </View>
                </View>

                {previo?.sk_tipo_carga === "CONT" && (
                  <>
                    <Text style={{ fontWeight: "bold" }}>Contenedores</Text>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View style={{ width: "100%" }}>
                        <Select
                          data={contenedores}
                          value={contenedores.find(
                            (val) => val.value === selectContenedor?.value,
                          )}
                          onChange={setSelectContenedor}
                        ></Select>
                      </View>
                    </View>
                  </>
                )}

                <Text style={{ fontWeight: "bold", marginVertical: 5 }}>
                  Observaciones
                </Text>
                <InputArea
                  placeholder="Observaciones"
                  value={inputObservaciones}
                  onChangeText={(text) => setInputObservaciones(text)}
                />
              </View>
            </View>

            <Divider style={{ marginVertical: 5 }}></Divider>

            {/* VISOR DE IMAGENES */}
            <View style={{ paddingHorizontal: 10 }}>
              <View>
                {/* Imagenes subidas */}
                <Text style={{ fontSize: 20, textAlign: "center" }}>
                  Imagenes subidas
                </Text>
                <View style={{ flexDirection: "column" }}>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}
                  >
                    {imagenes_subidas.map((imagen, index) => {
                      return (
                        <View key={index}>
                          {index <= 11 && (
                            <Pressable
                              onPress={() => {
                                setPermisoEliminarFoto(false);
                                setUriImg(imagen);
                                setModalVisible(true);
                              }}
                            >
                              <Image
                                source={imagen}
                                style={{
                                  borderRadius: 5,
                                  width: 88,
                                  height: 80,
                                }}
                                contentFit="cover"
                                transition={1000}
                              />
                            </Pressable>
                          )}
                        </View>
                      );
                    })}
                  </View>
                </View>

                {/* Imagenes no subidas */}
                <Text style={{ fontSize: 20, textAlign: "center" }}>
                  Imagenes no subidas
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 5 }}
                >
                  {imagenes_no_subidas.map((imagen, index) => {
                    return (
                      <View key={index}>
                        {index <= 7 && (
                          <Pressable
                            onPress={() => {
                              setPermisoEliminarFoto(true);
                              setUriImg(imagen);
                              setModalVisible(true);
                            }}
                          >
                            <Text>{imagen.s_modelo}</Text>
                            <Image
                              source={imagen}
                              style={{ borderRadius: 5, width: 88, height: 80 }}
                              contentFit="cover"
                              transition={1000}
                            />
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>

          <Button
            onPress={() => drawerFotografia.current?.close()}
            mode="contained"
            style={{ backgroundColor: "white", borderRadius: 0 }}
          >
            <Text style={{ color: ColorPrimary.color }}>CERRAR</Text>
          </Button>
        </BottomSheetView>
      </BottomSheet>

      <Portal>
        <Dialog
          visible={isModalVisible}
          onDismiss={() => setModalVisible(false)}
        >
          {/* Tabla de licencias */}
          <Dialog.Content>
            <Image
              source={uriImg}
              style={{
                borderRadius: 10,
                width: "100%",
                height: 500,
                backgroundColor: "blue",
              }}
              contentFit="cover"
              transition={1000}
            />
          </Dialog.Content>

          <Dialog.Actions>
            {permisoEliminarFoto ? (
              <Button onPress={() => eliminarFoto(uriImg)}>Eliminar</Button>
            ) : (
              <></>
            )}
            <Button onPress={() => setModalVisible(false)}>Cerrar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {sk_estatus_reconocedor !== "FI" && (
        <Portal>
          <FAB.Group
            fabStyle={{ backgroundColor: menu ? "#d12812" : "#22c55e" }}
            color="white"
            containerStyle={{ backgroundColor: "blue" }}
            open={menu}
            visible={flotante}
            icon={menu ? "close" : "invoice-text-check-outline"}
            actions={[
              {
                visible: true,
                icon: "checkbox-marked-outline",
                color: "#22c55e",
                label: "Finalizar Previos",
                labelTextColor: "#827C7C",
                onPress: () => {
                  finalizarPrevio();
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
