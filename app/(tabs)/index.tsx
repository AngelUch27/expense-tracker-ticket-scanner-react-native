import { View, Text, StyleSheet, Button } from "react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control de Gastos 💰🔥</Text>

      <View style={styles.button}>
        <Button
          title="Agregar gasto"
          onPress={() => router.push("/add")}
        />
      </View>

      <View style={styles.button}>
        <Button
          title="Ver movimientos"
          onPress={() => router.push("/(tabs)/transactions")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
  },
  button: {
    width: "80%",
    marginVertical: 10,
  },
});