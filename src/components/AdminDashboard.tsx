// Admin dashboard component
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { productService, getCoupleNames } from '../firebase/services';
import ProductForm, { type ProductFormData } from './ProductForm';
import ProductTable from './ProductTable';
import AdminHeader from './AdminHeader';
import CoupleSettings from './CoupleSettings';
import GradientButton from './GradientButton';
import { inputStyle } from './FormField';
import { getProductStatus, STATUS, type Product, type ProductStatus } from '../utils/status';
import { colors, gradients } from '../theme/colors';

// Ordem de exibição: disponíveis, reservados, pagos e recebidos
const STATUS_ORDER: ProductStatus[] = [STATUS.AVAILABLE, STATUS.RESERVED, STATUS.PAID, STATUS.RECEIVED];

const STAT_LABELS: Record<ProductStatus, string> = {
  available: 'Disponíveis',
  reserved: 'Reservados',
  paid: 'Pagos',
  received: 'Recebidos'
};

const WEB_URL = (process.env.EXPO_PUBLIC_WEB_URL || 'https://letis-wedding.netlify.app').replace(/\/+$/, '');

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const ownerUid = user!.uid;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [donorFilter, setDonorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProductStatus>('all');
  const [activeTab, setActiveTab] = useState<'products' | 'settings'>('products');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const productsData = await productService.getAllProducts(ownerUid);
      setProducts(productsData);
    } catch (err) {
      setError('Erro ao carregar presentes.');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData: ProductFormData) => {
    try {
      await productService.createProduct(ownerUid, productData as unknown as Record<string, unknown>);
      setShowForm(false);
      loadProducts();
    } catch (err) {
      setError('Erro ao criar presente.');
      console.error('Error creating product:', err);
    }
  };

  const handleUpdateProduct = async (productId: string, updateData: ProductFormData) => {
    try {
      await productService.updateProduct(ownerUid, productId, updateData as unknown as Record<string, unknown>);
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      setError('Erro ao atualizar presente.');
      console.error('Error updating product:', err);
    }
  };

  // As ações abaixo recarregam a lista e repassam o erro para o diálogo da tabela
  const runAction = <A extends unknown[]>(action: (...args: A) => Promise<unknown>, errorMessage: string) =>
    async (...args: A): Promise<void> => {
      try {
        await action(...args);
      } catch (err) {
        console.error(errorMessage, err);
        throw err;
      } finally {
        loadProducts(true);
      }
    };

  const handleDeleteProduct = runAction(
    (id: string) => productService.deleteProduct(ownerUid, id), 'Error deleting product:'
  );
  const handleReleaseProduct = runAction(
    (id: string) => productService.releaseProduct(ownerUid, id), 'Error releasing product:'
  );
  const handleReturnProduct = runAction(
    (id: string) => productService.returnProduct(ownerUid, id), 'Error returning product:'
  );
  const handleTransferReservation = runAction(
    (id: string, name: string) => productService.transferReservation(ownerUid, id, name), 'Error transferring reservation:'
  );
  const handleAssignDonor = runAction(
    (id: string, name: string) => productService.assignDonor(ownerUid, id, name), 'Error assigning donor:'
  );
  const handleMarkReceived = runAction(
    (id: string, name: string) => productService.markReceived(ownerUid, id, name), 'Error marking as received:'
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch = !searchTerm ||
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDonor = !donorFilter ||
      (product.reservedBy && product.reservedBy.toLowerCase().includes(donorFilter.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || getProductStatus(product) === statusFilter;

    return matchesSearch && matchesDonor && matchesStatus;
  }).sort((a, b) =>
    STATUS_ORDER.indexOf(getProductStatus(a)) - STATUS_ORDER.indexOf(getProductStatus(b))
  );

  const publicUrl = `${WEB_URL}/l/${ownerUid}`;

  // Abre o compartilhamento nativo do Android (o usuário escolhe o WhatsApp)
  const handleShareList = async () => {
    try {
      const names = await getCoupleNames(ownerUid);
      const couple = [names?.brideName, names?.groomName].filter(Boolean).join(' & ');
      const message = [
        couple ? `💕 Lista de presentes de ${couple}` : '💕 Nossa lista de presentes',
        '',
        'Escolha seu presente por aqui:',
        publicUrl
      ].join('\n');

      await Share.share({ message });
    } catch (err) {
      console.error('Erro ao compartilhar lista:', err);
      Alert.alert('Erro', 'Erro ao compartilhar a lista. Tente novamente.');
    }
  };

  // Abre a lista pública no navegador
  const handleViewPublicList = async () => {
    try {
      await Linking.openURL(publicUrl);
    } catch (err) {
      console.error('Erro ao abrir lista pública:', err);
      Alert.alert('Erro', 'Não foi possível abrir a lista pública.');
    }
  };

  if (loading) {
    return (
      <View style={styles.dashboard}>
        <AdminHeader onSignOut={signOut} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Carregando dashboard...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.dashboard}>
      <AdminHeader onSignOut={signOut} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.main} keyboardShouldPersistTaps="handled">
          <View style={styles.dashboardHeader}>
            <Text style={styles.title}>Dashboard Administrativo</Text>
            <View style={styles.headerButtons}>
              <GradientButton
                label="📋 Lista Pública"
                colors={gradients.orange}
                onPress={handleViewPublicList}
                paddingVertical={10}
                paddingHorizontal={18}
                fontSize={13.6}
              />
              <GradientButton
                label="📤 Compartilhar Lista"
                colors={gradients.green}
                onPress={handleShareList}
                paddingVertical={10}
                paddingHorizontal={18}
                fontSize={13.6}
              />
              <GradientButton
                label="+ Adicionar Presente"
                colors={gradients.accent}
                onPress={() => setShowForm(true)}
                paddingVertical={10}
                paddingHorizontal={18}
                fontSize={13.6}
              />
            </View>
          </View>

          <View style={styles.tabs}>
            {([
              ['products', '📦 Gerenciar Presentes'],
              ['settings', '💕 Configurações do Casal']
            ] as const).map(([tab, label]) => {
              const active = activeTab === tab;
              return (
                <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabWrap}>
                  {active ? (
                    <GradientButton
                      label={label}
                      colors={gradients.accent}
                      onPress={() => setActiveTab(tab)}
                      paddingVertical={10}
                      paddingHorizontal={16}
                      fontSize={13.6}
                      style={styles.tabActive}
                    />
                  ) : (
                    <View style={styles.tab}>
                      <Text style={styles.tabText}>{label}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {!!error && (
            <View style={styles.error}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={() => setError('')} hitSlop={8}>
                <Text style={styles.errorClose}>×</Text>
              </Pressable>
            </View>
          )}

          {activeTab === 'products' && (
            <>
              <View style={styles.filters}>
                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Buscar por presente:</Text>
                  <TextInput
                    style={styles.filterInput}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    placeholder="Digite o nome do presente..."
                    placeholderTextColor="#9aa8b5"
                  />
                </View>

                <View style={styles.filterGroup}>
                  <Text style={styles.filterLabel}>Filtrar por doador:</Text>
                  <TextInput
                    style={styles.filterInput}
                    value={donorFilter}
                    onChangeText={setDonorFilter}
                    placeholder="Digite o nome do doador..."
                    placeholderTextColor="#9aa8b5"
                  />
                </View>
              </View>

              <View style={styles.stats}>
                <Pressable
                  style={[styles.statCard, statusFilter === 'all' && styles.statSelected]}
                  onPress={() => setStatusFilter('all')}
                >
                  <Text style={styles.statTitle}>Total de Presentes</Text>
                  <Text style={styles.statNumber}>{products.length}</Text>
                </Pressable>
                {STATUS_ORDER.map((status) => (
                  <Pressable
                    key={status}
                    style={[styles.statCard, statusFilter === status && styles.statSelected]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text style={styles.statTitle}>{STAT_LABELS[status]}</Text>
                    <Text style={styles.statNumber}>
                      {products.filter((p) => getProductStatus(p) === status).length}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <ProductTable
                products={filteredProducts}
                onEdit={setEditingProduct}
                onDelete={handleDeleteProduct}
                onRelease={handleReleaseProduct}
                onReturn={handleReturnProduct}
                onTransferReservation={handleTransferReservation}
                onAssignDonor={handleAssignDonor}
                onMarkReceived={handleMarkReceived}
              />
            </>
          )}

          {activeTab === 'settings' && <CoupleSettings ownerUid={ownerUid} />}
        </ScrollView>
      </KeyboardAvoidingView>

      {showForm && (
        <ProductForm onSubmit={handleCreateProduct} onClose={() => setShowForm(false)} />
      )}

      {editingProduct && (
        <ProductForm
          product={editingProduct}
          onSubmit={(data) => handleUpdateProduct(editingProduct.id, data)}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dashboard: { flex: 1, backgroundColor: colors.background },
  main: { paddingVertical: 15, paddingHorizontal: 10 },
  dashboardHeader: { alignItems: 'center', gap: 20, marginBottom: 30 },
  title: { color: colors.primary, fontSize: 22.4, fontWeight: '300', textAlign: 'center' },
  headerButtons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 },
  tabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: colors.border
  },
  tabWrap: { flexShrink: 1 },
  tab: { paddingVertical: 10, paddingHorizontal: 16, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  tabText: { color: colors.secondary, fontSize: 13.6, fontWeight: '500' },
  tabActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    boxShadow: '0 2px 8px rgba(136, 204, 221, 0.3)'
  },
  error: {
    backgroundColor: colors.errorBg,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.error
  },
  errorText: { color: colors.error, flexShrink: 1 },
  errorClose: { color: colors.error, fontSize: 19.2 },
  filters: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    boxShadow: '0 5px 15px rgba(36, 70, 103, 0.1)',
    elevation: 3,
    marginBottom: 30,
    gap: 20
  },
  filterGroup: {},
  filterLabel: { color: colors.primary, fontWeight: '500', marginBottom: 8, fontSize: 12.8 },
  filterInput: { ...inputStyle },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 30 },
  statCard: {
    flexGrow: 1,
    flexBasis: 100,
    backgroundColor: 'white',
    paddingVertical: 25,
    paddingHorizontal: 5,
    borderRadius: 15,
    boxShadow: '0 5px 15px rgba(36, 70, 103, 0.1)',
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center'
  },
  statSelected: { borderColor: colors.accent },
  statTitle: {
    color: colors.secondary,
    fontSize: 9.6,
    fontWeight: '500',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center'
  },
  statNumber: { color: colors.primary, fontSize: 32, fontWeight: '300' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 400 },
  loadingText: { color: colors.secondary, fontSize: 16, marginTop: 20 }
});

export default AdminDashboard;
