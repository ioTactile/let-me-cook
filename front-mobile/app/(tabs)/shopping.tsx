import React, { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  View,
  StyleSheet,
  FlatList,
  PanResponder,
  Animated,
  type GestureResponderHandlers,
} from 'react-native';

import { FAB, useTheme, Text, Card, IconButton } from 'react-native-paper';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { theme } from '@/constants/Theme';

import { useGetShoppingLists } from '@/hooks/use-get-shopping-lists';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useDeleteShoppingList } from '@/app/shopping/_mutations/use-delete-shopping-list';

export default function ShoppingListsScreen() {
  const theme = useTheme();
  const [dragging, setDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [pan] = useState(() => new Animated.ValueXY());
  const [panHandlers, setPanHandlers] = useState<Partial<GestureResponderHandlers>>({});
  const draggedItemRef = useRef<string | null>(null);

  const { data: lists, isLoading, error } = useGetShoppingLists();

  const { showSnackbar } = useSnackbarStore();

  const { mutate: deleteShoppingList } = useDeleteShoppingList();

  const deleteShoppingListRef = useRef(deleteShoppingList);
  const showSnackbarRef = useRef(showSnackbar);

  useEffect(() => {
    deleteShoppingListRef.current = deleteShoppingList;
    showSnackbarRef.current = showSnackbar;
  }, [deleteShoppingList, showSnackbar]);

  useEffect(() => {
    const responder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDragging(true);
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.moveY > 600 && draggedItemRef.current) {
          deleteShoppingListRef.current(draggedItemRef.current, {
            onSuccess: () => {
              showSnackbarRef.current('Liste de courses supprimée avec succès');
            },
            onError: () => {
              showSnackbarRef.current('Erreur lors de la suppression de la liste de courses');
            },
          });
        }
        setDragging(false);
        draggedItemRef.current = null;
        setDraggedItem(null);
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    });
    setPanHandlers(responder.panHandlers);
  }, [pan]);

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
        data={lists}
        renderItem={({ item }) => (
          <Animated.View
            style={[
              styles.cardContainer,
              dragging && draggedItem === item.id && styles.dragging,
              {
                transform: [
                  { translateX: draggedItem === item.id ? pan.x : 0 },
                  { translateY: draggedItem === item.id ? pan.y : 0 },
                ],
              },
            ]}
            {...panHandlers}
            onTouchStart={() => {
              draggedItemRef.current = item.id;
              setDraggedItem(item.id);
            }}
          >
            <Card
              style={styles.card}
              onPress={() => {
                if (!dragging) {
                  router.push({
                    pathname: '/shopping/[id]',
                    params: { id: item.id },
                  });
                }
              }}
            >
              <Card.Content>
                <Text variant="titleLarge">{item.name}</Text>
                <View style={styles.listInfo}>
                  <Text variant="bodyMedium">{item.items.length} articles</Text>
                  <Text variant="bodySmall" style={styles.status}>
                    {item.status === 'pending' ? 'En cours' : 'Terminée'}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() =>
          router.push({
            pathname: '/shopping/new',
          })
        }
      />

      {dragging && (
        <View style={styles.trashContainer}>
          <IconButton
            icon="delete"
            size={40}
            iconColor={theme.colors.error}
            style={styles.trashIcon}
          />
        </View>
      )}
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
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    elevation: 4,
  },
  dragging: {
    opacity: 0.5,
  },
  listInfo: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    color: theme.colors.secondary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  error: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
  trashContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  trashIcon: {
    backgroundColor: theme.colors.background,
  },
});
