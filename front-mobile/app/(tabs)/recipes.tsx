import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { FAB, useTheme } from 'react-native-paper';

export default function RecipesScreen() {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() =>
          router.push({
            pathname: '/recipe/new',
          })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
