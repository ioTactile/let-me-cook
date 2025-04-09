import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { router } from "expo-router";

import { FAB, useTheme, Text, Card } from "react-native-paper";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { useGetAppliances } from "@/hooks/use-get-appliances";
import { theme } from "@/constants/Theme";

export default function AppliancesScreen() {
  const theme = useTheme();

  const { data: appliances, isLoading, error } = useGetAppliances();

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
        data={appliances}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => {
              router.push({
                pathname: "/appliance/[id]",
                params: { id: item.id },
              });
            }}
          >
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
        onPress={() => {
          router.push("/appliance/new");
        }}
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
    color: theme.colors.error,
    textAlign: "center",
    marginTop: 20,
  },
});
