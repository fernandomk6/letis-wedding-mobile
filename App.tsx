import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import Login from './src/components/Login';
import AdminDashboard from './src/components/AdminDashboard';
import { colors } from './src/theme/colors';

// Sem rotas: logado vai para o painel admin, deslogado para o login
const Root = () => {
  const { user } = useAuth();
  return user ? <AdminDashboard /> : <Login />;
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" />
          <Root />
        </SafeAreaView>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background }
});
