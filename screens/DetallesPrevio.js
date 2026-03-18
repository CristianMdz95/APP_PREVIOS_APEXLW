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
  BackHandler,
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

export default function DetallesPrevio({ navigation }) {
  const route = useRoute();
  const { sk_previo, sk_estatus_reconocedor } = route.params;

  const [loading_cargar_datos, set_loading_cargar_datos] = useState(true);
  const [menu, setMenu] = useState(false);
  const [flotante, setFlotante] = useState(false);
  const [previo, setPrevio] = useState(null);
  const [contenedores, setContenedores] = useState([]);

  const [TotalSubidas, setTotalSubidas] = useState(0);

  const [imagenes_subidas, set_imagenes_subidas] = useState([]);
  const [imagenes_no_subidas, set_imagenes_no_subidas] = useState([]);
  const [subirImagenes, setSubirImagenes] = useState(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [uriImg, setUriImg] = useState(null);
  const [permisoEliminarFoto, setPermisoEliminarFoto] = useState(false);

  /* DIALOG DE GUARDAR */
  const [showConfirmGuardar, setShowConfirmGuardar] = useState(false);
  const [loadingGuardar, setLoadingGuardar] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      setFlotante(true);
    }, []),
  );

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

      setTotalSubidas(subidasFiles.length);
      //setTotalNoSubidas(noSubidasFiles.length);
    } catch (error) {
      console.log("mostrarImagenes error:", error);
    }
  };

  /* ===================== */
  useFocusEffect(
    useCallback(() => {
      obtenerDatos();
    }, []),
  );

  /* ===================== */

  useEffect(() => {
    const tabActual = routes[index].key;
    set_texto_tab(tabActual);
  }, [index]);

  const obtenerDatos = async () => {
    set_loading_cargar_datos(true);

    let response = await Util_apiServices(
      "/api/agen/traf/prev-apli/api-previos/obtenerPrevio",
      "POST",
      { sk_previo },
    );

    let modelos = response?.data?.modelos.map((value, index) => ({
      label: value.s_modelo,
      value: value.sk_previo_modelo,
    }));

    let contenedores = response.data.contenedores.map((contendor) => ({
      label: contendor.s_numero_contenedor,
      value: contendor.sk_previo_contenedor,
    }));

    response.data.select_modelos = modelos;
    response.data.select_contenedores = contenedores;

    setPrevio(response.data);
    setContenedores(contenedores);
    set_loading_cargar_datos(false);
  };

  const finalizarPrevio = async () => {
    alert("PROXIMAMENTE");
  };

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
                    ? imagenes_no_subidas[imagenes_no_subidas.length]
                    : imagenes_subidas?.[imagenes_subidas.length - 1]
                      ? imagenes_subidas?.[imagenes_subidas.length - 1]
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
              paddingHorizontal: 10,
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
                    //drawerFotografia.current?.expand();
                    setFlotante(false);
                    navigation.navigate("Fotografias", {
                      previo_data: previo,
                      sk_previo: sk_previo,
                      sk_estatus_reconocedor: sk_estatus_reconocedor,
                    });
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
                  setShowConfirmGuardar(true);
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

      <Portal>
        <Dialog
          visible={showConfirmGuardar}
          onDismiss={() => setShowConfirmGuardar(false)}
        >
          <Dialog.Title>Notificación</Dialog.Title>
          <Dialog.Content>
            <Text>¿Estás seguro de finalizar este Previo?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowConfirmGuardar(false)}>
              Cancelar
            </Button>

            <Button
              disabled={loadingGuardar}
              onPress={async () => {
                try {
                  setLoadingGuardar(true);

                  await finalizarPrevio(); // tu función real

                  setShowConfirmGuardar(false);
                } catch (error) {
                  console.log(error);
                } finally {
                  setLoadingGuardar(false);
                }
              }}
            >
              Sí, Finalizar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
