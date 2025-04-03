import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";

import { FAB, useTheme, Text, Card } from "react-native-paper";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { ShoppingList } from "@/types";
import { shoppingLists } from "@/services/api.service";

export default function ShoppingScreen() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();

  useEffect(() => {
    loadShoppingLists();
  }, []);

  const loadShoppingLists = async () => {
    try {
      setLoading(true);
      const response = await shoppingLists.getAll();
      setLists(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des listes de courses");
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
        data={lists}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => {}}>
            <Card.Content>
              <Text variant="titleLarge">{item.name}</Text>
              <View style={styles.listInfo}>
                <Text variant="bodyMedium">{item.items.length} articles</Text>
                <Text variant="bodySmall" style={styles.status}>
                  {item.status === "pending" ? "En cours" : "Terminée"}
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
  listInfo: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  status: {
    color: "#666",
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
