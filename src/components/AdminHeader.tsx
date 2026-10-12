// Admin header component
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { colors } from '../theme/colors';

const AdminHeader = ({ onSignOut }: { onSignOut: () => void }) => (
  <View style={styles.header}>
    <View style={styles.logo}>
      <Text style={styles.title}>Letis Wedding</Text>
      <Text style={styles.subtitle}>Dashboard Administrativo</Text>
    </View>

    <View style={styles.actions}>
      <Pressable onPress={onSignOut} style={styles.signout}>
        <Text style={styles.signoutText}>Sair</Text>
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'white',
    boxShadow: '0 2px 20px rgba(36, 70, 103, 0.1)',
    elevation: 4,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: { flexShrink: 1 },
  title: { color: colors.primary, fontSize: 20.8, fontWeight: '300', letterSpacing: 2 },
  subtitle: { color: colors.secondary, fontSize: 12.8, marginTop: 5, fontWeight: '400' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  signout: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10
  },
  signoutText: { color: colors.error, fontSize: 12, fontWeight: '500' }
});

export default AdminHeader;
