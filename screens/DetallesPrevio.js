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

/* ===================== */
const arrayModelos = [
  { label: "Vacío", value: null },
  { label: "Modelo 1", value: "MODELO1" },
  { label: "Modelo 2", value: "MODELO2" },
];

export default function DetallesPrevio({ navigation }) {
  const bottomSheetRef = useRef(null);
  const route = useRoute();
  const { sk_previo, sk_estatus_reconocedor } = route.params;

  const [previo, setPrevio] = useState(null);
  const [contenedor, setContenedor] = useState([]);
  const [formContenedor, setFormContenero] = useState(null);
  const [selectModelo, setSelectModelo] = useState(null);

  const [TotalSubidas, setTotalSubidas] = useState(0);

  const [imagenes_subidas, set_imagenes_subidas] = useState([]);
  const [imagenes_no_subidas, set_imagenes_no_subidas] = useState([]);
  const [subirImagenes, setSubirImagenes] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [uriImg, setUriImg] = useState(null);
  const [permisoEliminarFoto, setPermisoEliminarFoto] = useState(false);

  const basePath = `${FileSystem.documentDirectory}${sk_previo}`;

  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);

  const [routes] = React.useState([
    { key: "reconocedores", title: "Reconocedores" },
    { key: "contenedores", title: "Contenedores" },
    { key: "modelos", title: "Modelos" },
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
    } catch (error) {
      console.log("Error cámara:", error);
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
      setTotalNoSubidas(noSubidasFiles.length);
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
      Util_apiServices(
        "/api/agen/traf/prev-apli/api-previos/obtenerPrevio",
        "POST",
        { sk_previo },
      ).then((res) => setPrevio(res.data));
    }, []),
  );

  /* ===================== */
  return (
    <>
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
                  <Text variant="bodyMedium">{previo?.nombre_tipo_carga}</Text>
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
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 0,
                }}
              >
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
                  bottomSheetRef.current?.expand();
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

          <Card style={{ width: "100%", marginTop: 15 }}>
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

          {/* TABS */}
          <Card style={{ flex: 1, backgroundColor: "red" }}>
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: layout.width }}
              renderTabBar={(props) => (
                <TabBar
                  {...props}
                  scrollEnabled
                  indicatorStyle={{ backgroundColor: colorPrimary.color }}
                  style={{ backgroundColor: colorPrimary.secondary }}
                  activeColor={colorPrimary.color}
                  inactiveColor="#9CA3AF"
                />
              )}
            />
          </Card>

          <View style={{ flexDirection: "row", gap: 13, marginTop: 15 }}>
            <Card style={{ width: "48%" }}>
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

            {!previo?.s_guias ? (
              <Card style={{ width: "48%" }}>
                <Card.Content>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
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
              <Card style={{ width: "48%" }}>
                <Card.Content>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
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
            )}
          </View>

          <View style={{ flexDirection: "row", gap: 13, marginVertical: 15 }}>
            <Card style={{ width: "48%" }}>
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

            <Card style={{ width: "48%" }}>
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
          </View>
          {sk_estatus_reconocedor === "FI" ? (
            <></>
          ) : (
            <View style={{ marginTop: 0, marginBottom: 15 }}>
              <TouchableOpacity
                style={{
                  padding: 10,
                  backgroundColor: "#22c55e",
                  borderRadius: 7,
                  height: 60,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => finalizarPrevio()}
              >
                <Text style={{ color: "white", fontSize: 16 }}>
                  Finalizar Previos
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      <BottomSheet ref={bottomSheetRef} index={0} snapPoints={[1, "95%"]}>
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
                <Text style={{ fontWeight: "bold" }}>Contenedor</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: "100%" }}>
                    <Select
                      data={contenedor}
                      value={contenedor.find(
                        (val) => val.value === formContenedor?.value,
                      )}
                      onChange={setFormContenero}
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
                </View>

                <Text style={{ fontWeight: "bold" }}>Modelo</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: "100%" }}>
                    <Select
                      data={arrayModelos}
                      value={arrayModelos.find(
                        (val) => val.value === selectModelo?.value,
                      )}
                      onChange={setSelectModelo}
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
                      onPress={subirFotos}
                      disabled={
                        imagenes_no_subidas?.length === 0 ? true : false
                      }
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
                              key={index}
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
                            key={index}
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
            onPress={() => bottomSheetRef.current?.close()}
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
    </>
  );
}
