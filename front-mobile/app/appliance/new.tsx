import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { TextInput, Button, useTheme, Text, IconButton } from 'react-native-paper';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import {
  createApplianceSchema,
  type CreateApplianceInputs,
} from '@/app/appliance/_schemas/create-appliance';
import { useCreateAppliance } from '@/app/appliance/_mutations/use-create-appliance';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { theme } from '@/constants/Theme';

export default function NewApplianceScreen() {
  const theme = useTheme();
  const { showSnackbar } = useSnackbarStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateApplianceInputs>({
    resolver: zodResolver(createApplianceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
    mode: 'onChange',
  });

  const { mutate: createAppliance, isPending } = useCreateAppliance();

  const onSubmit: SubmitHandler<CreateApplianceInputs> = async (data) => {
    createAppliance(data, {
      onSuccess: () => {
        router.back();
      },
      onError: (error) => {
        showSnackbar(error.message || 'Une erreur est survenue', 'error');
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineMedium" style={styles.title}>
          Nouvel appareil
        </Text>
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Nom de l'appareil"
            value={value}
            onChangeText={onChange}
            error={!!errors.name}
            style={styles.input}
          />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <Controller
        control={control}
        name="description"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Description (optionnelle)"
            value={value || ''}
            onChangeText={onChange}
            error={!!errors.description}
            style={styles.input}
            multiline
            numberOfLines={4}
          />
        )}
      />
      {errors.description && <Text style={styles.error}>{errors.description.message}</Text>}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isPending}
        disabled={isPending}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        Ajouter l&apos;appareil
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  error: {
    color: theme.colors.error,
    marginBottom: 8,
  },
});
