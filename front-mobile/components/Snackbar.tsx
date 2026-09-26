import React from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar as PaperSnackbar, Text, useTheme } from 'react-native-paper';
import { useSnackbarStore } from '@/stores/snackbar.store';

export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

export function Snackbar() {
  const theme = useTheme();
  const { visible, message, type, hideSnackbar } = useSnackbarStore();

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.primary;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return '#FFA726';
      case 'info':
        return theme.colors.secondary;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <PaperSnackbar
      visible={visible}
      onDismiss={hideSnackbar}
      style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}
    >
      <Text style={styles.message}>{message}</Text>
    </PaperSnackbar>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  message: {
    color: '#fff',
  },
});
