import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Card, Text } from "react-native-paper";
import { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text variant="titleLarge">{recipe.title}</Text>
        <Text variant="bodyMedium" numberOfLines={2}>
          {recipe.description}
        </Text>
        <View style={styles.recipeInfo}>
          <Text variant="bodySmall">
            {recipe.cookingTime} min • {recipe.difficulty}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  recipeInfo: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
