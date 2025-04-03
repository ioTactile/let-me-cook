import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";

import { FAB, useTheme, Text, Card } from "react-native-paper";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { FridgeItem } from "@/types";
import { fridge } from "@/services/api.service";

export default function FridgeScreen() {
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();

  useEffect(() => {
    loadFridgeItems();
  }, []);

  const loadFridgeItems = async () => {
    try {
      setLoading(true);
      const response = await fridge.getAll();
      setFridgeItems(response.data);
    } catch (err) {
      setError("Erreur lors du chargement du contenu du frigo");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={fridgeItems}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => {}}>
            <Card.Content>
              <Text variant="titleLarge">{item.ingredientName}</Text>
              <View style={styles.itemInfo}>
                <Text variant="bodyMedium">
                  {item.quantity} {item.unit}
                </Text>
                <Text variant="bodySmall" style={styles.expirationDate}>
                  Expire le {new Date(item.expirationDate).toLocaleDateString()}
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
        onPress={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    color: "#666",
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
