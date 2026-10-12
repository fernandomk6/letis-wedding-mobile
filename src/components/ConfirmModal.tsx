// Modal de confirmação reutilizável
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme/colors';

interface Props {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  error?: string;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal = ({
  title = 'Confirmar',
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  error = '',
  children,
  onConfirm,
  onCancel
}: Props) => (
  <Modal transparent animationType="fade" statusBarTranslucent onRequestClose={() => !loading && onCancel()}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Pressable style={styles.overlay} onPress={() => !loading && onCancel()}>
        <Pressable style={styles.content} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          {children}
          {!!error && (
            <View style={styles.error}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <View style={styles.actions}>
            <Pressable
              style={[styles.button, styles.cancel, loading && styles.disabled]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: colors.secondary }]}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, danger ? styles.danger : styles.confirm, loading && styles.disabled]}
              onPress={onConfirm}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>{loading ? 'Aguarde...' : confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </KeyboardAvoidingView>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 70, 103, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    padding: 28,
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
  },
  title: { marginBottom: 12, fontSize: 20.8, fontWeight: '500', color: colors.primary, textAlign: 'center' },
  message: { marginBottom: 24, color: colors.secondary, lineHeight: 24, textAlign: 'center', fontSize: 16 },
  error: { backgroundColor: colors.errorBg, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: colors.error, fontSize: 14.4 },
  actions: { flexDirection: 'column-reverse', gap: 12 },
  button: { padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '500' },
  cancel: { backgroundColor: '#f5f5f5' },
  confirm: { backgroundColor: colors.secondary },
  danger: { backgroundColor: colors.error },
  disabled: { opacity: 0.7 }
});

export default ConfirmModal;
