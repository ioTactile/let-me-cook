import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { TextInput, Button, Text } from 'react-native-paper';

import { RegisterInputs, registerSchema } from '@/app/auth/_schemas/register';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useRegister } from '@/app/auth/_mutations/register';

export default function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
    },
    mode: 'onChange',
  });

  const { mutate: register, isPending } = useRegister();

  const handleRegister: SubmitHandler<RegisterInputs> = async (data) => {
    register(data);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Créer un compte
      </Text>

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            label="Nom d'utilisateur"
            mode="outlined"
            autoCapitalize="none"
            style={styles.input}
          />
        )}
      />
      {errors.username && <Text style={styles.error}>{errors.username.message}</Text>}

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            value={value}
            onChangeText={onChange}
            label="Email"
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
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
      {errors.password && <Text style={styles.error}>{errors.password.message}</Text>}

      <Button
        mode="contained"
        onPress={handleSubmit(handleRegister)}
        loading={isPending}
        disabled={isPending}
        style={styles.button}
      >
        S&apos;inscrire
      </Button>
      <Button
        mode="text"
        onPress={() => router.push('/auth/login')}
        disabled={isPending}
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
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
