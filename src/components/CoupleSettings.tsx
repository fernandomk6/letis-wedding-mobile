import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { updateCoupleNames, getCoupleNames } from '../firebase/services';
import {
  PALETTES_BY_FAMILY,
  COLOR_FAMILIES,
  DEFAULT_PALETTE_ID,
  getPalette,
  type Palette
} from '../theme/palettes';
import FormField, { inputStyle } from './FormField';
import { colors, diagonal, gradients } from '../theme/colors';

interface FormData {
  brideName: string;
  groomName: string;
  pixKey: string;
  weddingDate: string;
  publicMessage: string;
  paletteId: string;
}

const PALETTE_ROWS = 3;

const swatchColors = (p: Palette) => [p.primary, p.secondary, p.accent, p.light, p.background];

const Swatches = ({ palette, width }: { palette: Palette; width?: number }) => (
  <View style={[styles.swatches, width ? { width } : null]}>
    {swatchColors(palette).map((c, i) => (
      <View key={`${c}-${i}`} style={{ flex: 1, backgroundColor: c }} />
    ))}
  </View>
);

// 'YYYY-MM-DD' <-> Date (sem deslocamento de fuso)
const parseDate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return y && m && d ? new Date(y, m - 1, d) : new Date();
};
const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const toDisplay = (value: string) => {
  const [y, m, d] = value.split('-');
  return y && m && d ? `${d}/${m}/${y}` : '';
};

const CoupleSettings = ({ ownerUid }: { ownerUid: string }) => {
  const [formData, setFormData] = useState<FormData>({
    brideName: '',
    groomName: '',
    pixKey: '',
    weddingDate: '',
    publicMessage: '',
    paletteId: DEFAULT_PALETTE_ID
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPaletteModal, setShowPaletteModal] = useState(false);
  const [familyFilter, setFamilyFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const names = await getCoupleNames(ownerUid);
        if (names) {
          setFormData({
            brideName: names.brideName || '',
            groomName: names.groomName || '',
            pixKey: names.pixKey || '',
            weddingDate: names.weddingDate || '',
            publicMessage: names.publicMessage || '',
            paletteId: names.paletteId || DEFAULT_PALETTE_ID
          });
        }
      } catch (error) {
        console.error('Erro ao carregar nomes do casal:', error);
      }
    };
    load();
  }, [ownerUid]);

  const setField = (name: keyof FormData) => (value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const openDatePicker = () => {
    DateTimePickerAndroid.open({
      value: parseDate(formData.weddingDate),
      mode: 'date',
      onValueChange: (_event, date) => setField('weddingDate')(toIso(date))
    });
  };

  const handleSubmit = async () => {
    if (
      !formData.brideName.trim() ||
      !formData.groomName.trim() ||
      !formData.weddingDate ||
      !formData.publicMessage.trim()
    ) {
      setMessage('Erro ao atualizar configurações do casal');
      return;
    }
    setIsLoading(true);
    setMessage('');

    try {
      await updateCoupleNames(
        ownerUid,
        formData.brideName,
        formData.groomName,
        formData.pixKey,
        formData.weddingDate,
        formData.publicMessage,
        formData.paletteId
      );
      setMessage('Configurações do casal atualizadas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      setMessage('Erro ao atualizar configurações do casal');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPalette = getPalette(formData.paletteId);
  const visiblePalettes = familyFilter === 'all'
    ? PALETTES_BY_FAMILY
    : PALETTES_BY_FAMILY.filter((p) => p.family === familyFilter);

  // Grade com 3 linhas que rola na horizontal (preenche coluna a coluna)
  const columns: (typeof visiblePalettes)[] = [];
  for (let i = 0; i < visiblePalettes.length; i += PALETTE_ROWS) {
    columns.push(visiblePalettes.slice(i, i + PALETTE_ROWS));
  }

  const success = message.includes('sucesso');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💕 Configurações do Casal</Text>
        <Text style={styles.headerText}>
          Configure os nomes da noiva e do noivo, e a chave PIX para exibir na lista de presentes
        </Text>
      </View>

      <View>
        <FormField
          label="Nome da Noiva"
          value={formData.brideName}
          onChangeText={setField('brideName')}
          placeholder="Digite o nome da noiva"
          style={styles.field}
        />

        <FormField
          label="Nome do Noivo"
          value={formData.groomName}
          onChangeText={setField('groomName')}
          placeholder="Digite o nome do noivo"
          style={styles.field}
        />

        <FormField
          label="Chave PIX para Contribuição (Opcional)"
          value={formData.pixKey}
          onChangeText={setField('pixKey')}
          placeholder="Ex: (11) 99999-9999 ou email@exemplo.com"
          autoCapitalize="none"
          style={styles.field}
        />

        <View style={styles.group}>
          <Text style={styles.label}>Data do Casamento</Text>
          <Pressable onPress={openDatePicker} style={inputStyle}>
            <Text style={{ color: formData.weddingDate ? '#000' : '#9aa8b5', fontSize: 14.4 }}>
              {formData.weddingDate ? toDisplay(formData.weddingDate) : 'dd/mm/aaaa'}
            </Text>
          </Pressable>
        </View>

        <FormField
          label="Mensagem Pública"
          value={formData.publicMessage}
          onChangeText={setField('publicMessage')}
          placeholder="Digite uma mensagem para exibir aos convidados na lista de presentes"
          multiline
          numberOfLines={4}
          style={[styles.field, { minHeight: 100 }]}
        />

        <View style={styles.group}>
          <Text style={styles.label}>Paleta de Cores da Lista Pública</Text>
          <Pressable style={styles.trigger} onPress={() => setShowPaletteModal(true)}>
            <Swatches palette={selectedPalette} width={120} />
            <Text style={[styles.paletteName, { flexShrink: 1 }]} numberOfLines={1}>{selectedPalette.name}</Text>
            <Text style={styles.triggerAction}>Alterar</Text>
          </Pressable>
        </View>

        <Pressable onPress={handleSubmit} disabled={isLoading} style={[styles.saveWrap, isLoading && { opacity: 0.7 }]}>
          <LinearGradient colors={[...gradients.accent]} start={diagonal.start} end={diagonal.end} style={styles.save}>
            <Text style={styles.saveText}>{isLoading ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}</Text>
          </LinearGradient>
        </Pressable>

        {!!message && (
          <View style={[styles.message, success ? styles.messageSuccess : styles.messageError]}>
            <Text style={{ color: success ? '#155724' : '#721c24', textAlign: 'center', fontWeight: '500', fontSize: 14.4 }}>
              {message}
            </Text>
          </View>
        )}
      </View>

      <Modal transparent animationType="fade" statusBarTranslucent visible={showPaletteModal} onRequestClose={() => setShowPaletteModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowPaletteModal(false)}>
          <Pressable style={styles.modal} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolha a paleta de cores</Text>
              <Pressable onPress={() => setShowPaletteModal(false)} hitSlop={8}>
                <Text style={styles.modalClose}>×</Text>
              </Pressable>
            </View>

            <View style={styles.familyFilter}>
              <Pressable
                style={[styles.chip, familyFilter === 'all' && styles.chipActive]}
                onPress={() => setFamilyFilter('all')}
              >
                <Text style={styles.chipText}>Todas</Text>
              </Pressable>
              {COLOR_FAMILIES.map((f) => (
                <Pressable
                  key={f.id}
                  style={[styles.chip, familyFilter === f.id && styles.chipActive]}
                  onPress={() => setFamilyFilter(f.id)}
                >
                  <View style={[styles.dot, { backgroundColor: f.swatch }]} />
                  <Text style={styles.chipText}>{f.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.hint}>Deslize para o lado para ver mais paletas.</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.grid}>
              {columns.map((column, ci) => (
                <View key={ci} style={styles.gridColumn}>
                  {column.map((p) => {
                    const selected = formData.paletteId === p.id;
                    return (
                      <Pressable
                        key={p.id}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        style={[styles.option, selected && styles.optionSelected]}
                        onPress={() => {
                          setField('paletteId')(p.id);
                          setShowPaletteModal(false);
                        }}
                      >
                        <Swatches palette={p} />
                        <Text style={styles.paletteName} numberOfLines={2}>{p.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    boxShadow: '0 5px 15px rgba(36, 70, 103, 0.1)',
    elevation: 3,
    padding: 15,
    marginBottom: 15
  },
  header: { alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: colors.primary, fontSize: 19.2, fontWeight: '600', marginBottom: 10, textAlign: 'center' },
  headerText: { color: colors.secondary, fontSize: 13.6, lineHeight: 20, textAlign: 'center' },
  group: { marginBottom: 18 },
  label: { color: colors.primary, fontWeight: '500', marginBottom: 8, fontSize: 14.4 },
  field: { fontSize: 14.4 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 10
  },
  triggerAction: { marginLeft: 'auto', color: colors.secondary, fontSize: 13.6 },
  swatches: {
    flexDirection: 'row',
    height: 28,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)'
  },
  paletteName: { fontSize: 12.8, color: colors.primary, fontWeight: '500' },
  saveWrap: { boxShadow: '0 2px 8px rgba(136, 204, 221, 0.3)', borderRadius: 10 },
  save: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, alignItems: 'center' },
  saveText: { color: 'white', fontSize: 13.6, fontWeight: '600', letterSpacing: 0.5 },
  message: { marginTop: 15, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  messageSuccess: { backgroundColor: '#d4edda', borderColor: '#c3e6cb' },
  messageError: { backgroundColor: '#f8d7da', borderColor: '#f5c6cb' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 70, 103, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  modal: { backgroundColor: 'white', borderRadius: 20, width: '100%', maxWidth: 900, maxHeight: '90%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { color: colors.primary, fontSize: 18.7, fontWeight: '500', flexShrink: 1 },
  modalClose: { fontSize: 32, lineHeight: 34, color: colors.secondary },
  familyFilter: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#e3e6ea',
    borderRadius: 20,
    backgroundColor: 'white'
  },
  chipActive: { borderColor: colors.primary, backgroundColor: '#eef3f8' },
  chipText: { color: colors.primary, fontSize: 13.6 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.15)' },
  hint: { marginBottom: 8, color: colors.secondary, fontSize: 13.6 },
  grid: { paddingTop: 4, paddingHorizontal: 4, paddingBottom: 12, gap: 10 },
  gridColumn: { width: 150, gap: 10 },
  option: {
    gap: 8,
    padding: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e3e6ea',
    borderRadius: 10
  },
  optionSelected: { borderColor: colors.primary, boxShadow: '0 0 0 3px rgba(36, 70, 103, 0.2)' }
});

export default CoupleSettings;
