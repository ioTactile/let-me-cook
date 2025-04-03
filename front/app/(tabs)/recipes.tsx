import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { router } from "expo-router";

import { FAB, useTheme, Text } from "react-native-paper";
import { RecipeCard } from "@/components/RecipeCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";

import { Recipe } from "@/types";
import { recipes } from "@/services/api.service";

export default function RecipesScreen() {
  const [recipeList, setRecipeList] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const theme = useTheme();

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipes.getAll();
      setRecipeList(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des recettes");
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
        data={recipeList}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() =>
              router.push({
                pathname: "/recipe/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() =>
          router.push({
            pathname: "/recipe/new",
          })
        }
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
