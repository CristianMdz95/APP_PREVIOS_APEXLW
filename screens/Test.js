import * as React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import colorPrimary from "../data/ColorPrimary";

export default function Test() {
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

  return (
    <View style={{ flex: 1 }}>
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
    </View>
  );
}
