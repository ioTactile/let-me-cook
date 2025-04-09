import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";

import { TextInput, Button, Text } from "react-native-paper";

import { auth } from "@/services/api.service";
import { useAuth } from "@/stores/auth.store";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await auth.login(email, password);
      await login(response.token);
      router.replace("/");
    } catch (err) {
      setError("Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Let Me Cook
      </Text>
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
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      >
        Se connecter
      </Button>
      <Button
        mode="text"
        onPress={() => router.push("/auth/register")}
        style={styles.button}
      >
        Créer un compte
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
