import { Tabs } from "expo-router";

import { useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function TabLayout() {
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
            <Icon name="food" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fridge"
        options={{
          title: "Frigo",
          tabBarIcon: ({ color, size }) => (
            <Icon name="fridge" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appliances"
        options={{
          title: "Appareils",
          tabBarIcon: ({ color, size }) => (
            <Icon name="microwave" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: "Courses",
          tabBarIcon: ({ color, size }) => (
            <Icon name="cart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
