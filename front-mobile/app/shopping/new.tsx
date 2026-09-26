import { useState } from "react";
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateShoppingListInputs,
  createShoppingListSchema,
} from "@/app/shopping/_schemas/create-shopping-list";
import { CreateShoppingListItemInputs } from "@/app/shopping/_schemas/create-shopping-list-item";
import { useCreateShoppingList } from "@/app/shopping/_mutations/use-create-shopping-list";
import { useGetFrequentItems } from "@/hooks/use-get-frequent-items";
import { useSearchItems } from "@/hooks/use-search-items";
import { Unit } from "@/types/enums";
import { theme } from "@/constants/Theme";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  ActivityIndicator,
  TextInput,
  Dialog,
  Button,
  Menu,
  IconButton,
  Text,
} from "react-native-paper";
import { translateUnit } from "@/utils/translate-unit";

export default function CreateShoppingListScreen() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<CreateShoppingListItemInputs>({
    ingredientName: "",
    quantity: 1,
    unit: Unit.PIECE,
  });
  const [showUnitMenu, setShowUnitMenu] = useState<boolean>(false);

  const {
    data: frequentItems,
    isLoading: isFrequentItemsLoading,
    error: frequentItemsError,
  } = useGetFrequentItems();
  const {
    data: searchResults,
    isFetching: isSearchLoading,
    error: searchError,
  } = useSearchItems(searchTerm);

  const { mutate: createShoppingList, isPending } = useCreateShoppingList();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateShoppingListInputs>({
    resolver: zodResolver(createShoppingListSchema),
    defaultValues: {
      name: "",
      items: [],
    },
    mode: "onChange",
  });

  const items = watch("items");

  const onSubmit: SubmitHandler<CreateShoppingListInputs> = (data) => {
    createShoppingList(data, {
      onSuccess: () => {
        router.back();
      },
    });
  };

  const addItem = (ingredientName: string) => {
    const currentItems = watch("items");
    setValue("items", [
      ...currentItems,
      {
        ingredientName,
        quantity: 1,
        unit: Unit.PIECE,
      },
    ]);
    setSearchTerm("");
  };

  const addManualItem = () => {
    if (newItem.ingredientName.trim()) {
      const currentItems = watch("items");
      setValue("items", [...currentItems, newItem]);
      setNewItem({
        ingredientName: "",
        quantity: 1,
        unit: Unit.PIECE,
      });
      setShowDialog(false);
    }
  };

  const removeItem = (index: number) => {
    const currentItems = watch("items");
    setValue(
      "items",
      currentItems.filter((_, i) => i !== index)
    );
  };

  const updateItem = (
    index: number,
    field: keyof CreateShoppingListItemInputs,
    value: any
  ) => {
    const currentItems = watch("items");
    setValue(
      "items",
      currentItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineMedium" style={styles.title}>
          Nouvelle liste de courses
        </Text>
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextInput
            placeholder="Nom de la liste"
            {...field}
            style={styles.input}
          />
        )}
      />
      {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un ingrédient..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          right={
            isSearchLoading && (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            )
          }
        />
        <Button
          mode="contained"
          onPress={() => setShowDialog(true)}
          style={styles.addButton}
        >
          Ajouter manuellement
        </Button>
      </View>

      {searchTerm ? (
        <ScrollView style={styles.searchResults}>
          {searchResults && searchResults.length > 0 ? (
            searchResults?.map((item) => (
              <TouchableOpacity
                key={item.ingredientName}
                style={styles.searchResultItem}
                onPress={() => addItem(item.ingredientName)}
              >
                {item.imageUrl && (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.itemImage}
                  />
                )}
                <View style={styles.itemTextContainer}>
                  <Text style={styles.searchResultText}>
                    {item.ingredientName}
                  </Text>
                  <Text style={styles.searchResultCount}>
                    ({item.count} fois)
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noItemsText}>Aucun ingrédient trouvé</Text>
          )}
        </ScrollView>
      ) : (
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggestions fréquentes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {isFrequentItemsLoading ? (
              <LoadingSpinner />
            ) : frequentItems && frequentItems.length > 0 ? (
              frequentItems.map((item) => (
                <TouchableOpacity
                  key={item.ingredientName}
                  style={styles.suggestionItem}
                  onPress={() => addItem(item.ingredientName)}
                >
                  {item.imageUrl && (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.suggestionImage}
                    />
                  )}
                  <Text style={styles.suggestionText}>
                    {item.ingredientName}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noItemsText}>Aucun ingrédient fréquent</Text>
            )}
          </ScrollView>
        </View>
      )}

      {frequentItemsError && (
        <Text style={styles.error}>
          Erreur lors du chargement des ingrédients fréquents
        </Text>
      )}

      {searchError && (
        <Text style={styles.error}>
          Erreur lors de la recherche d'ingrédients
        </Text>
      )}

      <ScrollView style={styles.itemsList}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <View style={styles.itemContent}>
              <Text style={styles.itemName}>{item.ingredientName}</Text>
              <View style={styles.quantityContainer}>
                <TextInput
                  mode="flat"
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  value={item.quantity.toString()}
                  onChangeText={(value) =>
                    updateItem(index, "quantity", parseFloat(value) || 0)
                  }
                />
                <View style={styles.unitContainer}>
                  <Text>{translateUnit(item.unit)}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeItem(index)}
            >
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      >
        <Text style={styles.submitButtonText}>
          {isPending ? "Création en cours..." : "Créer la liste"}
        </Text>
      </TouchableOpacity>

      <Dialog visible={showDialog} onDismiss={() => setShowDialog(false)}>
        <Dialog.Title>Ajouter un ingrédient</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Nom de l'ingrédient"
            value={newItem.ingredientName}
            onChangeText={(text) =>
              setNewItem({ ...newItem, ingredientName: text })
            }
            style={styles.dialogInput}
          />
          <View style={styles.dialogRow}>
            <TextInput
              label="Quantité"
              value={newItem.quantity.toString()}
              onChangeText={(text) =>
                setNewItem({
                  ...newItem,
                  quantity: parseFloat(text) || 0,
                })
              }
              keyboardType="numeric"
              style={styles.dialogQuantityInput}
            />
            <Menu
              visible={showUnitMenu}
              onDismiss={() => setShowUnitMenu(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setShowUnitMenu(true)}
                  style={styles.dialogUnitButton}
                >
                  {translateUnit(newItem.unit)}
                </Button>
              }
            >
              {Object.values(Unit).map((unit) => (
                <Menu.Item
                  key={unit}
                  onPress={() => {
                    setNewItem({ ...newItem, unit });
                    setShowUnitMenu(false);
                  }}
                  title={translateUnit(unit)}
                />
              ))}
            </Menu>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowDialog(false)}>Annuler</Button>
          <Button onPress={addManualItem}>Ajouter</Button>
        </Dialog.Actions>
      </Dialog>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    marginLeft: 8,
  },
  input: {
    marginBottom: 8,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
  },
  error: {
    color: theme.colors.error,
    marginBottom: 8,
  },
  searchResults: {
    maxHeight: 160,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.disabled,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultCount: {
    color: theme.colors.placeholder,
  },
  suggestionsContainer: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontWeight: "600",
    marginBottom: 8,
  },
  suggestionItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  suggestionImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  suggestionText: {
    textAlign: "center",
  },
  itemsList: {
    maxHeight: 256,
    height: "auto",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.disabled,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontWeight: "600",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityInput: {
    width: 80,
    marginRight: 8,
  },
  unitContainer: {
    borderWidth: 1,
    borderColor: theme.colors.disabled,
    borderRadius: 8,
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: theme.colors.error,
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  submitButtonText: {
    color: theme.colors.background,
    textAlign: "center",
    fontWeight: "600",
  },
  noItemsText: {
    textAlign: "center",
    color: theme.colors.placeholder,
    padding: 16,
  },
  addButton: {
    borderRadius: 8,
    marginTop: 8,
  },
  dialogInput: {
    marginBottom: 16,
  },
  dialogRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dialogQuantityInput: {
    flex: 1,
    marginRight: 8,
  },
  dialogUnitButton: {
    minWidth: 100,
  },
});
