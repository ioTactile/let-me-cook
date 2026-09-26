import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useGetShoppingList } from '@/hooks/use-get-shopping-list';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Text, IconButton, Checkbox, Divider } from 'react-native-paper';
import { theme } from '@/constants/Theme';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  UpdateShoppingListItemInputs,
  updateShoppingListItemSchema,
} from '@/app/shopping/_schemas/update-shopping-list-item';
import { ShoppingListItemStatus, Unit } from '@/types/enums';
import { useUpdateShoppingListStatus } from '@/app/shopping/_mutations/use-update-shopping-list-status';
import { useUpdateShoppingListItem } from '@/app/shopping/_mutations/use-update-shopping-list-item';
import { useSnackbarStore } from '@/stores/snackbar.store';

export default function ShoppingListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { showSnackbar } = useSnackbarStore();

  const { data: shoppingList, isLoading, error } = useGetShoppingList(id);

  const { setValue, control } = useForm<UpdateShoppingListItemInputs>({
    resolver: zodResolver(updateShoppingListItemSchema),
    defaultValues: {
      items: [],
    },
    mode: 'onChange',
  });

  const { mutate: updateShoppingListItems } = useUpdateShoppingListItem();

  useEffect(() => {
    if (shoppingList?.items) {
      setValue(
        'items',
        shoppingList?.items.map((item) => ({
          id: item.id,
          status: item.status as ShoppingListItemStatus,
          quantity: item.quantity,
          unit: item.unit as Unit,
        })),
      );
    }
  }, [shoppingList?.items, setValue]);

  const items = useWatch({ control, name: 'items' });

  const { mutate: updateShoppingListStatus, isPending } = useUpdateShoppingListStatus();

  const closeShoppingList = () => {
    const isAllItemsBought = items?.every((item) => item.status === ShoppingListItemStatus.BOUGHT);
    if (!isAllItemsBought) {
      showSnackbar('Veuillez cocher tous les produits');
      return;
    }

    if (!shoppingList?.id) {
      showSnackbar('Erreur lors de la clôture de la liste');
      return;
    }

    updateShoppingListItems({ id: shoppingList.id, data: { items } });
    updateShoppingListStatus({ id: shoppingList.id });
  };

  const toggleAllItems = () => {
    const allChecked = items?.every((item) => item.status === ShoppingListItemStatus.BOUGHT);

    const newStatus = allChecked ? ShoppingListItemStatus.PENDING : ShoppingListItemStatus.BOUGHT;

    setValue(
      'items',
      items?.map((item) => ({
        ...item,
        status: newStatus,
      })),
    );
  };

  const toggleItemStatus = (itemId: string) => {
    setValue(
      'items',
      items?.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status:
                item.status === ShoppingListItemStatus.PENDING
                  ? ShoppingListItemStatus.BOUGHT
                  : ShoppingListItemStatus.PENDING,
            }
          : item,
      ),
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !shoppingList) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Erreur lors du chargement de la liste de courses</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineMedium" style={styles.title}>
          {shoppingList.name}
        </Text>
      </View>

      <View style={styles.checkAllContainer}>
        <Checkbox
          status={
            items?.every((item) => item.status === ShoppingListItemStatus.BOUGHT)
              ? 'checked'
              : 'unchecked'
          }
          onPress={toggleAllItems}
        />
        <Text style={styles.checkAllText}>Tout cocher/décocher</Text>
      </View>

      <ScrollView style={styles.itemsList}>
        {items?.map((item, index) => {
          const listItem = shoppingList.items.find((i) => i.id === item.id);
          if (!listItem) return null;

          return (
            <View key={item.id}>
              <TouchableOpacity
                style={styles.itemContainer}
                onPress={() => toggleItemStatus(item.id)}
              >
                <Checkbox
                  status={item.status === ShoppingListItemStatus.BOUGHT ? 'checked' : 'unchecked'}
                  onPress={() => toggleItemStatus(item.id)}
                />
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{listItem.ingredientName}</Text>
                  <Text style={styles.itemDetails}>
                    {listItem.quantity} {listItem.unit}
                  </Text>
                </View>
                {listItem.imageUrl && (
                  <Image source={{ uri: listItem.imageUrl }} style={styles.itemImage} />
                )}
              </TouchableOpacity>
              {index < items.length - 1 && <Divider />}
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
        onPress={closeShoppingList}
        disabled={isPending}
      >
        <Text style={styles.submitButtonText}>
          {isPending ? 'Clôture en cours...' : 'Clôturer la liste'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  title: {
    marginLeft: 8,
    flex: 1,
  },
  checkAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  checkAllText: {
    marginLeft: 8,
  },
  itemsList: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.surface,
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
  },
  itemDetails: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginTop: 4,
  },
  error: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
  submitButton: {
    borderRadius: 0,
    padding: 16,
    marginTop: 16,
  },
  submitButtonText: {
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: '600',
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
  },
});
