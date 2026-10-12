import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle, type TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { diagonal } from '../theme/colors';

interface Props {
  label: string;
  colors: readonly [string, string];
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  paddingVertical?: number;
  paddingHorizontal?: number;
  fontSize?: number;
}

const GradientButton = ({
  label,
  colors,
  onPress,
  disabled,
  style,
  textStyle,
  paddingVertical = 12,
  paddingHorizontal = 24,
  fontSize = 16
}: Props) => (
  <Pressable onPress={onPress} disabled={disabled} style={[disabled && styles.disabled, style]}>
    <LinearGradient
      colors={[...colors]}
      start={diagonal.start}
      end={diagonal.end}
      style={[styles.gradient, { paddingVertical, paddingHorizontal }]}
    >
      <Text style={[styles.text, { fontSize }, textStyle]}>{label}</Text>
    </LinearGradient>
  </Pressable>
);

const styles = StyleSheet.create({
  gradient: { borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  text: { color: 'white', fontWeight: '500' },
  disabled: { opacity: 0.7 }
});

export default GradientButton;
