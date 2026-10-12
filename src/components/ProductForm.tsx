// Product form component for admin
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Line } from 'react-native-svg';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import FormField from './FormField';
import { colors, diagonal, gradients } from '../theme/colors';
import type { Product } from '../utils/status';

export interface ProductFormData {
  title: string;
  description: string;
  imageUrl: string;
  price: number | null;
}

interface Props {
  product?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void> | void;
  onClose: () => void;
}

// Largura máxima da imagem da galeria: mantém o documento bem abaixo de 1 MiB
const MAX_IMAGE_WIDTH = 800;

const ProductForm = ({ product, onSubmit, onClose }: Props) => {
  const [title, setTitle] = useState(product?.title || '');
  const [description, setDescription] = useState(product?.description || '');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const [price, setPrice] = useState(typeof product?.price === 'number' ? String(product.price) : '');
  const [loading, setLoading] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!title.trim()) {
      setError('Informe o nome do presente.');
      return;
    }
    setLoading(true);

    try {
      const parsed = price.trim() === '' ? null : Number(price.replace(',', '.'));
      await onSubmit({
        title,
        description,
        imageUrl,
        price: parsed !== null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null
      });
    } catch (err) {
      setError('Erro ao salvar presente.');
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    setError('');
    setPickingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1
      });
      if (result.canceled || !result.assets?.[0]) return;

      const asset = result.assets[0];
      const resize = asset.width > MAX_IMAGE_WIDTH ? [{ resize: { width: MAX_IMAGE_WIDTH } }] : [];
      const processed = await manipulateAsync(asset.uri, resize, {
        compress: 0.7,
        format: SaveFormat.JPEG,
        base64: true
      });
      if (!processed.base64) throw new Error('Falha ao converter a imagem');

      setImageFailed(false);
      setImageUrl(`data:image/jpeg;base64,${processed.base64}`);
    } catch (err) {
      setError('Não foi possível carregar a imagem da galeria.');
      console.error('Erro ao selecionar imagem:', err);
    } finally {
      setPickingImage(false);
    }
  };

  const isDataUri = imageUrl.startsWith('data:');

  return (
    <Modal transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={styles.overlay} onPress={onClose}>
          <Pressable style={styles.content} onPress={() => {}}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{product ? 'Editar Presente' : 'Adicionar Presente'}</Text>
              <Pressable onPress={onClose} style={styles.close} hitSlop={8}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
              <FormField
                label="Nome do Presente *"
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Jogo de panelas inox"
                editable={!loading}
              />

              <FormField
                label="Descrição"
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Conjunto 5 peças, material inox..."
                multiline
                numberOfLines={3}
                editable={!loading}
              />

              <FormField
                label="Valor (R$)"
                value={price}
                onChangeText={setPrice}
                placeholder="Ex: 150.00"
                keyboardType="decimal-pad"
                editable={!loading}
              />

              <FormField
                label="URL da Imagem"
                value={isDataUri ? '' : imageUrl}
                onChangeText={(text) => {
                  setImageFailed(false);
                  setImageUrl(text);
                }}
                placeholder={isDataUri ? 'Imagem da galeria selecionada' : 'Cole uma imagem aqui'}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Pressable
                onPress={handlePickImage}
                disabled={loading || pickingImage}
                style={[styles.galleryButton, (loading || pickingImage) && styles.disabled]}
              >
                <Text style={styles.galleryText}>
                  {pickingImage ? 'Carregando imagem...' : '🖼️ Escolher da galeria'}
                </Text>
              </Pressable>

              {!!imageUrl && (
                <View style={styles.preview}>
                  {imageFailed ? (
                    <View style={styles.imageError}>
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.error} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <Circle cx={12} cy={12} r={10} />
                        <Line x1={15} y1={9} x2={9} y2={15} />
                        <Line x1={9} y1={9} x2={15} y2={15} />
                      </Svg>
                      <Text style={styles.imageErrorText}>Erro ao carregar imagem</Text>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.previewImage}
                      resizeMode="cover"
                      onError={() => setImageFailed(true)}
                    />
                  )}
                </View>
              )}

              {!!error && (
                <View style={styles.error}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <View style={styles.actions}>
                <Pressable
                  style={[styles.button, styles.cancel, loading && styles.disabled]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={[styles.buttonText, { color: colors.secondary }]}>Cancelar</Text>
                </Pressable>
                <Pressable onPress={handleSubmit} disabled={loading} style={loading && styles.disabled}>
                  <LinearGradient colors={[...gradients.accent]} start={diagonal.start} end={diagonal.end} style={styles.button}>
                    <Text style={[styles.buttonText, { color: 'white' }]}>
                      {loading ? 'Salvando...' : product ? 'Atualizar' : 'Adicionar'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(36, 70, 103, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(36, 70, 103, 0.2)'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: { color: colors.primary, fontSize: 20.8, fontWeight: '500' },
  close: { width: 25, height: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  closeText: { fontSize: 24, color: colors.muted, lineHeight: 26 },
  form: { paddingVertical: 20, paddingHorizontal: 15 },
  galleryButton: {
    marginTop: -8,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: 'white',
    alignItems: 'center'
  },
  galleryText: { color: colors.secondary, fontSize: 14.4, fontWeight: '500' },
  preview: {
    marginTop: -5,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    maxHeight: 200
  },
  previewImage: { width: '100%', height: 200 },
  imageError: { alignItems: 'center', gap: 10, padding: 20 },
  imageErrorText: { color: colors.error, fontSize: 14.4, fontWeight: '500', textAlign: 'center' },
  error: {
    backgroundColor: colors.errorBg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.error
  },
  errorText: { color: colors.error, fontSize: 14.4 },
  actions: { flexDirection: 'column-reverse', gap: 10, marginTop: 10 },
  button: { padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { fontSize: 14.4, fontWeight: '500' },
  cancel: { backgroundColor: '#f5f5f5' },
  disabled: { opacity: 0.7 }
});

export default ProductForm;
