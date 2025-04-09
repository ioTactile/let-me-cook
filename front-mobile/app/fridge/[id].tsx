import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  Text,
  useTheme,
  Card,
  IconButton,
  Divider,
  Chip,
  List,
} from "react-native-paper";
import Markdown from "react-native-markdown-display";
import { theme } from "@/constants/Theme";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useGetFridgeItem } from "@/hooks/use-get-fridge-item";
import { useSnackbarStore } from "@/stores/snackbar.store";
import { useDeleteFridgeItem } from "@/app/fridge/_mutations/use-delete-fridge-item";
import { useConfirmationDialogStore } from "@/stores/confirmation-dialog.store";

export default function FridgeItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const theme = useTheme();

  const { showSnackbar } = useSnackbarStore();
  const { showDialog } = useConfirmationDialogStore();

  const { data: item, isLoading, error } = useGetFridgeItem(id);

  const { mutate: deleteFridgeItem, isPending } = useDeleteFridgeItem();

  const handleDelete = () => {
    deleteFridgeItem(id, {
      onSuccess: () => {
        showSnackbar("Produit supprimé avec succès", "success");
        router.back();
      },
      onError: () => {
        showSnackbar("Erreur lors de la suppression", "error");
      },
    });
  };

  const handleDeleteClick = () => {
    showDialog(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer ce produit ?",
      handleDelete
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !item) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Erreur lors du chargement du produit</Text>
      </View>
    );
  }

  const getExpirationStatus = () => {
    if (!item.expirationDate) return "info";
    const expiryDate = new Date(item.expirationDate);
    const today = new Date();
    const diffDays = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "error";
    if (diffDays < 3) return "warning";
    return "success";
  };

  const getExpirationText = () => {
    if (!item.expirationDate) return "Pas de date d'expiration";
    const expiryDate = new Date(item.expirationDate);
    const today = new Date();
    const diffDays = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) return "Expiré";
    if (diffDays === 0) return "Expire aujourd'hui";
    if (diffDays === 1) return "Expire demain";
    return `Expire dans ${diffDays} jours`;
  };

  const getExpirationColor = () => {
    const status = getExpirationStatus();
    switch (status) {
      case "error":
        return {
          background: theme.colors.errorContainer,
          text: theme.colors.error,
        };
      case "warning":
        return {
          background: "#FFF3E0",
          text: "#FFA726",
        };
      case "success":
        return {
          background: theme.colors.primaryContainer,
          text: theme.colors.primary,
        };
      default:
        return {
          background: theme.colors.surface,
          text: theme.colors.onSurface,
        };
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <IconButton
                icon="arrow-left"
                size={24}
                onPress={() => router.back()}
              />
              <Text variant="headlineMedium" style={styles.title}>
                {item.ingredientName}
              </Text>
            </View>
            <IconButton
              icon="delete"
              iconColor={theme.colors.error}
              size={24}
              loading={isPending}
              disabled={isPending}
              onPress={handleDeleteClick}
            />
          </View>

          <View style={styles.quantityContainer}>
            <Text variant="titleLarge">
              {item.quantity} {item.unit}
            </Text>
            <Chip
              mode="outlined"
              icon="clock"
              style={[
                styles.expirationChip,
                { backgroundColor: getExpirationColor().background },
              ]}
              textStyle={{ color: getExpirationColor().text }}
            >
              {getExpirationText()}
            </Chip>
          </View>

          {item.metadata?.analysis && (
            <List.Accordion
              title="Analyse nutritionnelle"
              titleStyle={styles.accordionTitle}
            >
              <View style={styles.analysisContainer}>
                <Markdown
                  style={{
                    body: {
                      color: theme.colors.onSurface,
                    },
                    heading3: {
                      marginTop: 16,
                      marginBottom: 12,
                    },
                  }}
                >
                  {item.metadata.analysis}
                </Markdown>
              </View>
            </List.Accordion>
          )}

          <Divider style={styles.divider} />

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text variant="titleMedium">Date d'ajout</Text>
              <Text variant="bodyLarge">
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>

            {item.expirationDate && (
              <View style={styles.detailRow}>
                <Text variant="titleMedium">Date d'expiration</Text>
                <Text variant="bodyLarge">
                  {new Date(item.expirationDate).toLocaleDateString()}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text variant="titleMedium">Dernière mise à jour</Text>
              <Text variant="bodyLarge">
                {new Date(item.updatedAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    margin: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  title: {
    flex: 1,
  },
  quantityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  expirationChip: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  error: {
    color: theme.colors.error,
    textAlign: "center",
    marginTop: 20,
  },
  accordionTitle: {
    fontWeight: "bold",
  },
  analysisContainer: {
    padding: 16,
  },
});
