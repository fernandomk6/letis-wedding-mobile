// Login component for admin authentication
import { useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { colors, diagonal, gradients } from '../theme/colors';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
    } catch (err) {
      const code = (err as { code?: string | number }).code;
      // 12501 / SIGN_IN_CANCELLED: usuário fechou o seletor de contas
      const cancelled = code === '12501' || code === 12501 || code === 'SIGN_IN_CANCELLED' ||
        (err as Error).message === 'Login cancelado';
      if (!cancelled) {
        setError('Não foi possível entrar com o Google. Tente novamente.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[...gradients.login]} start={diagonal.start} end={diagonal.end} style={styles.container}>
      <View style={styles.card}>
        <View>
          <Text style={styles.title}>Letis Wedding</Text>
          <Text style={styles.subtitle}>Crie e gerencie sua lista de presentes</Text>
        </View>

        <View>
          {!!error && (
            <View style={styles.error}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Pressable onPress={handleGoogleSignIn} disabled={loading} style={[styles.buttonWrap, loading && { opacity: 0.7 }]}>
            <LinearGradient colors={[...gradients.accent]} start={diagonal.start} end={diagonal.end} style={styles.button}>
              <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar com Google'}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Use sua conta Google para acessar sua lista</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 15 },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    boxShadow: '0 20px 40px rgba(36, 70, 103, 0.1)',
    elevation: 8,
    paddingVertical: 25,
    paddingHorizontal: 15,
    width: '100%',
    maxWidth: 400,
    alignItems: 'stretch'
  },
  title: { color: colors.primary, fontSize: 28.8, fontWeight: '300', letterSpacing: 2, textAlign: 'center', marginBottom: 10 },
  subtitle: { color: colors.secondary, fontSize: 14.4, fontWeight: '400', textAlign: 'center', marginBottom: 30 },
  error: {
    backgroundColor: colors.errorBg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.error
  },
  errorText: { color: colors.error, fontSize: 14.4 },
  buttonWrap: { marginTop: 10 },
  button: { padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 14.4, fontWeight: '500' },
  footer: { marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border },
  footerText: { color: colors.muted, fontSize: 12, textAlign: 'center' }
});

export default Login;
