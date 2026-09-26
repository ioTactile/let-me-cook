import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Text, useTheme, Card, IconButton, Divider } from 'react-native-paper';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useGetAppliance } from '@/hooks/use-get-appliance';
import { useSnackbarStore } from '@/stores/snackbar.store';
import { useDeleteAppliance } from '@/app/appliance/_mutations/use-delete-appliance';
import { useConfirmationDialogStore } from '@/stores/confirmation-dialog.store';
import { theme } from '@/constants/Theme';

export default function ApplianceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const theme = useTheme();

  const { showSnackbar } = useSnackbarStore();
  const { showDialog } = useConfirmationDialogStore();

  const { data: appliance, isLoading, error } = useGetAppliance(id);

  const { mutate: deleteAppliance, isPending } = useDeleteAppliance();

  const handleDelete = () => {
    deleteAppliance(id, {
      onSuccess: () => {
        showSnackbar('Appareil supprimé avec succès', 'success');
        router.back();
      },
      onError: () => {
        showSnackbar('Erreur lors de la suppression', 'error');
      },
    });
  };

  const handleDeleteClick = () => {
    showDialog(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cet appareil ?',
      handleDelete,
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !appliance) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Erreur lors du chargement de l&apos;appareil</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
              <Text variant="headlineMedium" style={styles.title}>
                {appliance.name}
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

          <Divider style={styles.divider} />

          <View style={styles.detailsContainer}>
            {appliance.description && (
              <View style={styles.detailRow}>
                <Text variant="titleMedium">Description</Text>
                <Text variant="bodyLarge">{appliance.description}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text variant="titleMedium">Date d&apos;ajout</Text>
              <Text variant="bodyLarge">{new Date(appliance.createdAt).toLocaleDateString()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text variant="titleMedium">Dernière mise à jour</Text>
              <Text variant="bodyLarge">{new Date(appliance.updatedAt).toLocaleDateString()}</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  error: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
});
