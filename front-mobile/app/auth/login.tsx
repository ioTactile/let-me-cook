import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";

import { TextInput, Button, Text } from "react-native-paper";

import { useLogin } from "@/app/auth/_mutations/login";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LoginInputs, loginSchema } from "@/app/auth/_schemas/login";
import { zodResolver } from "@hookform/resolvers/zod";
import { theme } from "@/constants/Theme";

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const { mutate: login, isPending } = useLogin();

  const handleLogin: SubmitHandler<LoginInputs> = async (data) => {
    login(data);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Let Me Cook
      </Text>

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            label="Email"
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        )}
      />
      {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            label="Mot de passe"
            mode="outlined"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
          />
        )}
      />
      {errors.password && (
        <Text style={styles.error}>{errors.password.message}</Text>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(handleLogin)}
        loading={isPending}
        disabled={isPending}
        style={styles.button}
      >
        Se connecter
      </Button>
      <Button
        mode="text"
        onPress={() => router.push("/auth/register")}
        disabled={isPending}
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
    color: theme.colors.error,
    marginBottom: 10,
  },
});
