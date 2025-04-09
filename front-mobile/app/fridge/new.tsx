import React, { useState } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { router } from "expo-router";

import {
  TextInput,
  Button,
  useTheme,
  Text,
  IconButton,
} from "react-native-paper";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import {
  createFridgeItemSchema,
  type CreateFridgeItemInputs,
} from "@/app/fridge/_schemas/create-fridge-item";
import { useCreateFridgeItem } from "@/app/fridge/_mutations/use-create-fridge-item";
import { useSnackbarStore } from "@/stores/snackbar.store";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { theme } from "@/constants/Theme";

export default function NewFridgeItemScreen() {
  const theme = useTheme();
  const { showSnackbar } = useSnackbarStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateFridgeItemInputs>({
    resolver: zodResolver(createFridgeItemSchema),
    defaultValues: {
      ingredientName: "",
      quantity: 1,
      unit: "",
      expiryDate: new Date(),
    },
    mode: "onChange",
  });

  const { mutate: createFridgeItem, isPending } = useCreateFridgeItem();

  const onSubmit: SubmitHandler<CreateFridgeItemInputs> = async (data) => {
    createFridgeItem(data, {
      onSuccess: () => {
        router.back();
      },
      onError: (error) => {
        showSnackbar(error.message || "Une erreur est survenue", "error");
      },
    });
  };

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setValue("expiryDate", selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineMedium" style={styles.title}>
          Nouvel ingrédient
        </Text>
      </View>

      <Controller
        control={control}
        name="ingredientName"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Nom de l'ingrédient"
            value={value}
            onChangeText={onChange}
            error={!!errors.ingredientName}
            style={styles.input}
          />
        )}
      />
      {errors.ingredientName && (
        <Text style={styles.error}>{errors.ingredientName.message}</Text>
      )}

      <Controller
        control={control}
        name="quantity"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Quantité"
            value={value.toString()}
            onChangeText={(text) => onChange(parseFloat(text) || 0)}
            keyboardType="numeric"
            error={!!errors.quantity}
            style={styles.input}
          />
        )}
      />
      {errors.quantity && (
        <Text style={styles.error}>{errors.quantity.message}</Text>
      )}

      <Controller
        control={control}
        name="unit"
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Unité (L, kg, g, etc.)"
            value={value}
            onChangeText={onChange}
            error={!!errors.unit}
            style={styles.input}
          />
        )}
      />
      {errors.unit && <Text style={styles.error}>{errors.unit.message}</Text>}

      <Controller
        control={control}
        name="expiryDate"
        render={({ field: { value } }) => (
          <>
            <TextInput
              label="Date d'expiration"
              value={value ? new Date(value).toISOString() : ""}
              onFocus={() => setShowDatePicker(true)}
              showSoftInputOnFocus={false}
              error={!!errors.expiryDate}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon="calendar"
                  onPress={() => setShowDatePicker(true)}
                />
              }
            />
            {showDatePicker && (
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </>
        )}
      />
      {errors.expiryDate && (
        <Text style={styles.error}>{errors.expiryDate.message}</Text>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit(onSubmit)}
        loading={isPending}
        disabled={isPending}
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
      >
        Ajouter au frigo
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
    flexDirection: "row",
    alignItems: "center",
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
