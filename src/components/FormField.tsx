import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors } from '../theme/colors';

interface Props extends TextInputProps {
  label?: string;
}

// Campo de formulário com o mesmo visual dos inputs do projeto web
const FormField = ({ label, style, editable = true, ...rest }: Props) => (
  <View style={styles.group}>
    {!!label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      placeholderTextColor="#9aa8b5"
      editable={editable}
      style={[styles.input, !editable && styles.disabled, rest.multiline && styles.multiline, style]}
      {...rest}
    />
  </View>
);

export const inputStyle = {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderWidth: 2,
  borderColor: colors.border,
  borderRadius: 10,
  fontSize: 14.4,
  color: '#000',
  backgroundColor: 'white'
} as const;

const styles = StyleSheet.create({
  group: { marginBottom: 20 },
  label: { color: colors.primary, fontWeight: '500', marginBottom: 8, fontSize: 12.8 },
  input: { ...inputStyle },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  disabled: { backgroundColor: '#f5f5f5' }
});

export default FormField;
