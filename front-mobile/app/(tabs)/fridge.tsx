import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { router } from "expo-router";

import { FAB, useTheme, Text, Card } from "react-native-paper";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { useGetFridgeItems } from "@/hooks/use-get-fridge-items";
import { theme } from "@/constants/Theme";

export default function FridgeScreen() {
  const theme = useTheme();

  const { data: fridgeItems, isLoading, error } = useGetFridgeItems();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={fridgeItems}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() =>
              router.push({ pathname: "/fridge/[id]", params: { id: item.id } })
            }
          >
            <Card.Content>
              <Text variant="titleLarge">{item.ingredientName}</Text>
              <View style={styles.itemInfo}>
                <Text variant="bodyMedium">
                  {item.quantity} {item.unit}
                </Text>
                <Text variant="bodySmall" style={styles.expirationDate}>
                  {item.expirationDate
                    ? `Expire le ${new Date(
                        item.expirationDate
                      ).toLocaleDateString()}`
                    : "Date d'expiration non renseignée"}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push("/fridge/new")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  itemInfo: {
    marginTop: 8,
  },
  expirationDate: {
    color: theme.colors.secondary,
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  error: {
    color: theme.colors.error,
    textAlign: "center",
    marginTop: 20,
  },
});
