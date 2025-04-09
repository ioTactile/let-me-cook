import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";

import { FAB, useTheme, Text, Card } from "react-native-paper";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { Appliance } from "@/types";
import { appliances } from "@/services/api.service";

export default function AppliancesScreen() {
  const [applianceList, setApplianceList] = useState<Appliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const theme = useTheme();

  useEffect(() => {
    loadAppliances();
  }, []);

  const loadAppliances = async () => {
    try {
      setLoading(true);
      const response = await appliances.getAll();
      setApplianceList(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des appareils");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appliance: Appliance) => {
    try {
      await appliances.update(appliance.id, appliance);
      setApplianceList(
        applianceList.map((item) =>
          item.id === appliance.id ? appliance : item
        )
      );
    } catch (err) {
      setError("Erreur lors de la mise à jour du statut");
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
        data={applianceList}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.applianceInfo}>
                <Text variant="titleLarge">{item.name}</Text>
                <Text variant="bodyMedium">{item.description}</Text>
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
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  applianceInfo: {
    flex: 1,
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
