import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();

  return <View>{/* Contenu à implémenter */}</View>;
}
