import { StyleSheet, Text, TouchableOpacity } from 'react-native';

export default function AppButton({ title, onPress, color = '#007AFF', style, textStyle }) {
  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: color }, style]} onPress={onPress}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 5 },
  text: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});