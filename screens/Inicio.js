import React, { useCallback, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
  Text,
  ActivityIndicator,
} from "react-native";
import { Divider, Card, Portal, FAB, Avatar } from "react-native-paper";
import useStorage from "../utils/Util_localStorage";
import { useFocusEffect } from "@react-navigation/native";
import { Util_apiServices } from "../utils/Util_apiServices";
import ColorPrimary from "../data/ColorPrimary";
import { Util_dateFormat } from "../utils/Util_dateFormat";
import Util_validarStorage from "../utils/Util_validarStorage";

export default function Inicio({ navigation }) {
  const { Set, Get, Remove } = useStorage();
  const [cargandoPrevios, setCargandoPrevios] = useState(false);
  const [previos, setPrevios] = useState([]);
  const [menu, setMenu] = useState(false);
  const [flotante, setFlotante] = useState(true);

  const [loading_cargar_datos, set_loading_cargar_datos] = useState(true);

  const cargarDetalles = async (sk_previo, sk_estatus_reconocedor) => {
    navigation.navigate("Detalles", { sk_previo, sk_estatus_reconocedor });
  };

  const obtenerDatos = async () => {
    set_loading_cargar_datos(true);
    const result = await Util_apiServices(
      "/api/agen/traf/prev-apli/api-previos/obtenerPrevios",
      "GET",
    );
    setPrevios(result.data);
    set_loading_cargar_datos(false);
  };

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor(ColorPrimary.color);
      obtenerDatos();
      setFlotante(true);
    }, []),
  );

  const salirAdministrador = async () => {
    await Remove("usuario");
    await Util_validarStorage({ navigation });
  };

  return loading_cargar_datos ? (
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
    <View style={{ flex: 1, gap: 6, padding: 6, backgroundColor: "#e5e7eb" }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={cargandoPrevios}
            onRefresh={obtenerDatos}
          />
        }
      >
        {Object.values(previos).length > 0 &&
          Object.entries(previos).map(([sk_previo, previo], index) => {
            let color_status =
              previo?.sk_estatus_reconocedor === "FsI" ? "#22c55e" : "#f59e0b";

            return (
              <Card
                key={sk_previo}
                style={{
                  borderLeftColor: color_status,
                  borderLeftWidth: 5,
                  marginBottom: 10,
                  backgroundColor: "white",
                }}
              >
                <Card.Content>
                  <View>
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setFlotante(false);
                        cargarDetalles(
                          previo?.sk_previo,
                          previo?.sk_estatus_reconocedor,
                        );
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text
                          variant="titleLarge"
                          style={{
                            color: "red",
                            fontSize: 16,
                            fontWeight: "bold",
                          }}
                        >
                          {previo?.i_folio}
                        </Text>

                        {previo?.sk_estatus_reconocedor === "FsI" ? (
                          <Text
                            numberOfLines={1}
                            style={{
                              color: color_status,
                              fontWeight: "lighter",
                              fontSize: 16,
                            }}
                          >
                            Finalizado
                          </Text>
                        ) : (
                          <Text
                            numberOfLines={1}
                            style={{
                              color: color_status,
                              fontWeight: "lighter",
                              fontSize: 16,
                            }}
                          >
                            EN PROCESO
                          </Text>
                        )}
                      </View>

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
                          <Text
                            variant="bodyMedium"
                            style={{ fontWeight: "bold" }}
                          >
                            Tipo de carga
                          </Text>
                          <Text variant="bodyMedium">
                            {previo?.nombre_tipo_carga}
                          </Text>
                        </View>

                        <View></View>

                        <View>
                          <Text
                            variant="bodyMedium"
                            style={{ fontWeight: "bold" }}
                          >
                            Bultos
                          </Text>
                          <Text
                            variant="bodyMedium"
                            style={{ textAlign: "center" }}
                          >
                            {previo?.i_bultos}
                          </Text>
                        </View>
                        <View>
                          <Text
                            variant="bodyMedium"
                            style={{ fontWeight: "bold" }}
                          >
                            Peso
                          </Text>
                          <Text
                            variant="bodyMedium"
                            style={{ textAlign: "center" }}
                          >
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
                          <Text
                            variant="bodyMedium"
                            style={{ fontWeight: "bold" }}
                          >
                            Fecha y Hora Confirmación
                          </Text>
                          <Text variant="bodyMedium">
                            {Util_dateFormat(previo?.d_fecha_confirmacion) +
                              " - " +
                              previo?.t_hora_confirmacion}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </Card.Content>
              </Card>
            );
          })}

        <Portal>
          <FAB.Group
            color="white"
            containerStyle={{ backgroundColor: "blue" }}
            open={menu}
            visible={flotante}
            icon={menu ? "close" : "apps"}
            actions={[
              {
                visible: true,
                icon: "logout",
                color: "red",
                onPress: () => {
                  salirAdministrador();
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
      </ScrollView>
    </View>
  );
}
