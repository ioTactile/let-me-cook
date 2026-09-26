import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recettes",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="food" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fridge"
        options={{
          title: "Frigo",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="fridge" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appliances"
        options={{
          title: "Appareils",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="microwave"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
