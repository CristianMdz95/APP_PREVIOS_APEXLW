import React, { useCallback, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Divider, Card, Text } from "react-native-paper";
import useStorage from "../utils/Util_localStorage";
import { useFocusEffect } from "@react-navigation/native";
import { Util_apiServices } from "../utils/Util_apiServices";
import ColorPrimary from "../data/ColorPrimary";

export default function Inicio({ navigation }) {
  const { Set, Get, Remove } = useStorage();
  const [cargandoPrevios, setCargandoPrevios] = useState(false);
  const [previos, setPrevios] = useState([]);

  const cargarDetalles = async (sk_previo, sk_estatus_reconocedor) => {
    navigation.navigate("Detalles", { sk_previo, sk_estatus_reconocedor });
  };

  const obtenerDatos = async () => {
    const result = await Util_apiServices(
      "/api/agen/traf/prev-apli/api-previos/obtenerPrevios",
      "GET"
    );
    setPrevios(result.data);
  };

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBackgroundColor(ColorPrimary.color);
      obtenerDatos();
    }, [])
  );

  return (
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
            return (
              <Card
                key={sk_previo}
                style={{ marginBottom: 10, backgroundColor: "white" }}
              >
                <Card.Content>
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      cargarDetalles(
                        previo?.sk_previo,
                        previo?.sk_estatus_reconocedor
                      )
                    }
                  >
                    <View style={{ flexDirection: "column" }}>
                      <Text
                        style={{ color: "red", fontWeight: "bold" }}
                        variant="titleLarge"
                      >
                        {previo?.i_folio}
                      </Text>
                      <Text variant="bodyLarge" numberOfLines={1}>
                        {previo?.s_nombre_cliente}
                      </Text>
                      <Text variant="bodyLarge" numberOfLines={1}>
                        {previo?.empresa_terminal}
                      </Text>
                      <Divider style={{ marginVertical: 5 }}></Divider>
                      <Text variant="labelLarge" numberOfLines={1}>
                        {previo?.s_referencias}
                      </Text>
                      <Text variant="labelLarge" numberOfLines={1}>
                        {previo?.s_contenedores || "-"}
                      </Text>
                      <Text variant="labelLarge" numberOfLines={1}>
                        {previo?.s_bls || "-"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Card.Content>
              </Card>
            );
          })}
      </ScrollView>
    </View>
  );
}
