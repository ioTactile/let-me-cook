import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";

import { TextInput, Button, Text } from "react-native-paper";

import { auth } from "@/services/api.service";
import { useAuth } from "@/services/auth.service";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleRegister = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await auth.register(email, password, username);
      await login(response.token);
      router.replace("/");
    } catch (err) {
      setError("Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Créer un compte
      </Text>
      <TextInput
        label="Nom d'utilisateur"
        value={username}
        onChangeText={setUsername}
        mode="outlined"
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        style={styles.input}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        style={styles.button}
      >
        S'inscrire
      </Button>
      <Button
        mode="text"
        onPress={() => router.push("/auth/login")}
        style={styles.button}
      >
        Déjà un compte ? Se connecter
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
});
