// Product list component for admin (visual de cards, igual à versão mobile do web)
import { useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';
import {
  getProductStatus,
  STATUS,
  STATUS_LABELS,
  formatPrice,
  type Product,
  type ProductStatus
} from '../utils/status';
import ConfirmModal from './ConfirmModal';
import { inputStyle } from './FormField';
import { colors, diagonal } from '../theme/colors';

const Icon = ({ size, color, children }: { size: number; color: string; children: ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);

type IconName = 'edit' | 'delete' | 'transfer' | 'release' | 'donor' | 'received' | 'return';

const ICONS: Record<IconName, ReactNode> = {
  edit: (
    <>
      <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <Path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </>
  ),
  delete: (
    <>
      <Polyline points="3,6 5,6 21,6" />
      <Path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
      <Line x1="10" y1="11" x2="10" y2="17" />
      <Line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  transfer: (
    <>
      <Path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2-2z" />
      <Path d="m8 21 4-7 4 7" />
      <Path d="M12 3v18" />
    </>
  ),
  release: (
    <>
      <Circle cx="12" cy="12" r="10" />
      <Line x1="15" y1="9" x2="9" y2="15" />
      <Line x1="9" y1="9" x2="15" y2="15" />
    </>
  ),
  donor: (
    <>
      <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Line x1="19" y1="8" x2="19" y2="14" />
      <Line x1="16" y1="11" x2="22" y2="11" />
    </>
  ),
  received: (
    <>
      <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <Polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  return: (
    <>
      <Polyline points="1 4 1 10 7 10" />
      <Path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </>
  )
};

// Cor de cada ação (texto, ícone e borda do botão)
const ACTION_COLORS: Record<IconName, string> = {
  edit: '#2196f3',
  delete: '#f44336',
  transfer: '#ff9800',
  release: '#f44336',
  donor: '#2e7d32',
  received: '#2e7d32',
  return: '#ff9800'
};

const BADGE_COLORS: Record<ProductStatus, { bg: string; fg: string }> = {
  available: { bg: '#e8f5e8', fg: '#2e7d32' },
  reserved: { bg: '#ffebee', fg: '#c62828' },
  paid: { bg: '#fff8e1', fg: '#b26a00' },
  received: { bg: '#e3f2fd', fg: '#1565c0' }
};

const formatDate = (date?: Date) => {
  if (!date) return '-';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

type DialogKind = 'delete' | 'release' | 'return' | 'receive' | 'transfer' | 'assign';

interface Dialog {
  kind: DialogKind;
  product: Product;
  step: 'name' | 'confirm';
}

interface Action {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
}

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => Promise<void>;
  onRelease: (id: string) => Promise<void>;
  onReturn: (id: string) => Promise<void>;
  onTransferReservation: (id: string, name: string) => Promise<void>;
  onAssignDonor: (id: string, name: string) => Promise<void>;
  onMarkReceived: (id: string, name: string) => Promise<void>;
}

const ProductTable = ({
  products,
  onEdit,
  onDelete,
  onRelease,
  onReturn,
  onTransferReservation,
  onAssignDonor,
  onMarkReceived
}: Props) => {
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [name, setName] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [busy, setBusy] = useState(false);

  const openDialog = (kind: DialogKind, product: Product) => {
    const needsName =
      kind === 'transfer' ||
      kind === 'assign' ||
      (kind === 'receive' && getProductStatus(product) === STATUS.AVAILABLE);
    setName('');
    setDialogError('');
    setDialog({ kind, product, step: needsName ? 'name' : 'confirm' });
  };

  const closeDialog = () => {
    if (!busy) setDialog(null);
  };

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
      setDialog(null);
    } catch {
      setDialogError('Não foi possível concluir a ação. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  const handleNameStep = () => {
    if (!dialog) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setDialogError('Informe o nome do doador.');
      return;
    }
    setDialogError('');
    const { kind, product } = dialog;
    if (kind === 'receive') {
      setDialog({ kind, product, step: 'confirm' });
    } else if (kind === 'transfer') {
      run(() => onTransferReservation(product.id, trimmed));
    } else {
      run(() => onAssignDonor(product.id, trimmed));
    }
  };

  const handleConfirmStep = () => {
    if (!dialog) return;
    const { kind, product } = dialog;
    if (kind === 'delete') return run(() => onDelete(product.id));
    if (kind === 'release') return run(() => onRelease(product.id));
    if (kind === 'return') return run(() => onReturn(product.id));
    return run(() => onMarkReceived(product.id, name.trim()));
  };

  const renderDialog = () => {
    if (!dialog) return null;
    const { kind, product, step } = dialog;
    const status = getProductStatus(product);

    if (step === 'name') {
      const titles: Partial<Record<DialogKind, string>> = {
        transfer: 'Transferir reserva',
        assign: 'Adicionar doador',
        receive: 'Marcar como recebido'
      };
      return (
        <ConfirmModal
          title={titles[kind]}
          message={`Informe o nome do doador de “${product.title}”.`}
          confirmLabel={kind === 'receive' ? 'Continuar' : 'Salvar'}
          loading={busy}
          error={dialogError}
          onConfirm={handleNameStep}
          onCancel={closeDialog}
        >
          <TextInput
            style={[inputStyle, styles.dialogInput]}
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleNameStep}
            placeholder="Digite o nome completo"
            placeholderTextColor="#9aa8b5"
            autoFocus
          />
        </ConfirmModal>
      );
    }

    const configs: Record<string, { title: string; message: string; confirmLabel: string; danger: boolean }> = {
      delete: {
        title: 'Excluir presente',
        message: `Tem certeza que deseja excluir “${product.title}”?`,
        confirmLabel: 'Excluir',
        danger: true
      },
      release: {
        title: status === STATUS.PAID ? 'Estornar pagamento' : 'Desvincular presente',
        message: status === STATUS.PAID
          ? `Estornar o pagamento de “${product.title}”? O presente volta a ficar disponível, sem doador.`
          : `Desvincular “${product.title}” de ${product.reservedBy}? O presente volta a ficar disponível.`,
        confirmLabel: status === STATUS.PAID ? 'Estornar' : 'Desvincular',
        danger: true
      },
      return: {
        title: 'Devolver presente',
        message: `Devolver “${product.title}”? O presente volta a ficar disponível, sem doador.`,
        confirmLabel: 'Devolver',
        danger: true
      },
      receive: {
        title: 'Confirmar recebimento',
        message: `Confirma o recebimento do item “${product.title}” do doador “${name.trim() || product.reservedBy}”?`,
        confirmLabel: 'Confirmar recebimento',
        danger: false
      }
    };

    return (
      <ConfirmModal
        {...configs[kind]}
        loading={busy}
        error={dialogError}
        onConfirm={handleConfirmStep}
        onCancel={closeDialog}
      />
    );
  };

  // Ações disponíveis para cada status
  const getActions = (product: Product): Action[] => {
    const status = getProductStatus(product);
    const edit: Action = { key: 'edit', icon: 'edit', label: 'Editar', onPress: () => onEdit(product) };
    const remove: Action = { key: 'delete', icon: 'delete', label: 'Excluir', onPress: () => openDialog('delete', product) };
    const assign: Action = { key: 'assign', icon: 'donor', label: 'Adicionar doador', onPress: () => openDialog('assign', product) };
    const receive: Action = { key: 'receive', icon: 'received', label: 'Recebido', onPress: () => openDialog('receive', product) };
    const transfer: Action = { key: 'transfer', icon: 'transfer', label: 'Transferir', onPress: () => openDialog('transfer', product) };
    const release: Action = { key: 'release', icon: 'release', label: 'Desvincular', onPress: () => openDialog('release', product) };
    const refund: Action = { ...release, label: 'Estornar' };
    const giveBack: Action = { key: 'return', icon: 'return', label: 'Devolver', onPress: () => openDialog('return', product) };

    switch (status) {
      case STATUS.AVAILABLE: return [edit, remove, assign, receive];
      case STATUS.RESERVED: return [transfer, receive, release];
      case STATUS.PAID: return [receive, refund];
      case STATUS.RECEIVED: return [giveBack];
      default: return [];
    }
  };

  const renderStatusBadge = (product: Product) => {
    const status = getProductStatus(product);
    const { bg, fg } = BADGE_COLORS[status];
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: fg }]}>{STATUS_LABELS[status].toUpperCase()}</Text>
      </View>
    );
  };

  // Data relevante conforme o status
  const getStatusDate = (product: Product) => {
    const status = getProductStatus(product);
    if (status === STATUS.PAID) return product.paidAt || product.reservedAt;
    if (status === STATUS.RECEIVED) return product.receivedAt;
    return product.reservedAt;
  };

  if (products.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Nenhum presente encontrado.</Text>
      </View>
    );
  }

  return (
    <>
      {products.map((product) => {
        const statusDate = getStatusDate(product);
        return (
          <View key={product.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardImage}>
                {product.imageUrl ? (
                  <Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover" />
                ) : (
                  <LinearGradient colors={[colors.border, colors.accent]} start={diagonal.start} end={diagonal.end} style={styles.placeholder}>
                    <Text style={styles.placeholderText}>🎁</Text>
                  </LinearGradient>
                )}
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{product.title}</Text>
                {!!product.description && <Text style={styles.cardDescription}>{product.description}</Text>}
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Valor:</Text>
                <Text style={styles.cardValue}>{formatPrice(product.price) || '-'}</Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Status:</Text>
                {renderStatusBadge(product)}
              </View>

              {!!product.reservedBy && (
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Doador:</Text>
                  <Text style={styles.cardValue}>{product.reservedBy}</Text>
                </View>
              )}

              {!!statusDate && (
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Data:</Text>
                  <Text style={styles.cardValue}>{formatDate(statusDate)}</Text>
                </View>
              )}

              {!!product.comment && (
                <View style={styles.cardRow}>
                  <Text style={styles.cardLabel}>Comentário:</Text>
                  <Text style={[styles.cardValue, styles.comment]}>{product.comment}</Text>
                </View>
              )}
            </View>

            <View style={styles.cardActions}>
              {getActions(product).map((action) => {
                const color = ACTION_COLORS[action.icon];
                return (
                  <Pressable
                    key={action.key}
                    onPress={action.onPress}
                    style={[styles.actionButton, { borderColor: color }]}
                  >
                    <Icon size={18} color={color}>{ICONS[action.icon]}</Icon>
                    <Text style={[styles.actionText, { color }]}>{action.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}

      {renderDialog()}
    </>
  );
};

const styles = StyleSheet.create({
  empty: {
    paddingVertical: 40,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    boxShadow: '0 5px 15px rgba(36, 70, 103, 0.1)',
    elevation: 3
  },
  emptyText: { textAlign: 'center', color: colors.secondary, fontSize: 16 },
  dialogInput: { marginBottom: 20, fontSize: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    boxShadow: '0 5px 15px rgba(36, 70, 103, 0.1)',
    elevation: 3,
    marginBottom: 20,
    overflow: 'hidden'
  },
  cardHeader: {
    padding: 15,
    gap: 12,
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  cardImage: {
    width: 300,
    maxWidth: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center'
  },
  image: { width: '100%', height: '100%' },
  placeholder: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 24 },
  cardInfo: { width: '100%', alignItems: 'center' },
  cardTitle: { color: colors.primary, fontSize: 19.2, fontWeight: '600', marginBottom: 8, lineHeight: 25, textAlign: 'center' },
  cardDescription: { color: colors.secondary, fontSize: 12.8, lineHeight: 18, textAlign: 'center' },
  cardBody: { paddingVertical: 12, paddingHorizontal: 15 },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
    marginBottom: 10
  },
  cardLabel: { color: colors.primary, fontWeight: '600', fontSize: 12.8 },
  cardValue: { color: colors.secondary, fontSize: 16, flexShrink: 1, textAlign: 'right' },
  comment: { flex: 1 },
  badge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  badgeText: { fontSize: 12.8, fontWeight: '500', letterSpacing: 0.5 },
  cardActions: { paddingVertical: 12, paddingHorizontal: 15, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionButton: {
    flexGrow: 1,
    flexBasis: 100,
    backgroundColor: 'white',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  actionText: { fontSize: 12.8, fontWeight: '500' }
});

export default ProductTable;
