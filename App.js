import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
  Platform,
} from "react-native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import MapView, { Marker } from "react-native-maps";
import axios from "axios";
import * as Location from "expo-location";
import * as Permissions from "expo-permissions";

export default function App() {
  const [busLine, setBusLine] = useState("");
  const [buses, setBuses] = useState([]);
  const [locationPermission, setLocationPermission] = useState(false);
  const [location, setLocation] = useState(null);

  const handleOnPress = async () => {
    try {
      const { data } = await axios({
        method: "POST",
        url: "http://montevideo.gub.uy/buses/rest/stm-online",
        data: {
          empresa: "50", // CUTCSA
          lineas: [busLine],
        },
      });
      // console.log(data);
      setBuses(data.features);
    } catch (error) {
      //console.log(error);
    }
  };

  useEffect(() => {
    const getPermission = async () => {
      const status = await Permissions.askAsync(
        Permissions.LOCATION_FOREGROUND
      );
      //console.log("STATUS: ", status);
      if (status.granted) {
        setLocation(await Location.getCurrentPositionAsync());
        setLocationPermission(true);
      }
    };
    getPermission();
  }, []);

  //console.log("LOCATION: ", location);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View>
        <View>
          <Text style={styles.title}>Ubicá tu bus</Text>
        </View>
        <View>
          <TextInput
            value={busLine}
            onChangeText={setBusLine}
            style={styles.input}
          />
          <TouchableOpacity style={styles.button} onPress={handleOnPress}>
            <Text style={styles.text}>Buscar</Text>
          </TouchableOpacity>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: -34.909557,
              longitude: -56.169695,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            {location && <Marker coordinate={location.coords} />}

            {buses.map((bus) => {
              return (
                <Marker
                  coordinate={{
                    latitude: bus.geometry.coordinates[1],
                    longitude: bus.geometry.coordinates[0],
                  }}
                  key={bus.properties.id}
                />
              );
            })}
          </MapView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  map: {
    height: 300,
    width: 300,
  },
  button: {
    backgroundColor: "#6495ED",
    margin: 20,
    borderRadius: 50,
    width: 100,
  },
  input: {
    borderColor: "#ccc",
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: 50,
    borderColor: "#6495ED",
    textAlign: "center",
  },
  text: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  title: {
    textAlign: "center",
    fontSize: 35,
    fontWeight: "bold",
    color: "#6495ED",
    marginBottom: 10,
  },
});
