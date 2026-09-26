import React from 'react';
import { Dialog, Button, Text } from 'react-native-paper';
import { useConfirmationDialogStore } from '@/stores/confirmation-dialog.store';
import { theme } from '@/constants/Theme';

export function ConfirmationDialog() {
  const { isVisible, title, message, onConfirm, hideDialog } = useConfirmationDialogStore();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    hideDialog();
  };

  return (
    <Dialog visible={isVisible} onDismiss={hideDialog}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <Text>{message}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={hideDialog}>Annuler</Button>
        <Button onPress={handleConfirm} textColor={theme.colors.error}>
          Confirmer
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
