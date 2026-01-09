import { View, Text, FlatList, StyleSheet, Linking } from 'react-native';
import AppButton from '../components/AppButton';

const CONTACTS = [
  { id: '1', name: 'Barangay Captain', phone: '09123456789' },
  { id: '2', name: 'Tibungco Police Station', phone: '911' },
  { id: '3', name: 'Health Center', phone: '09987654321' },
];

export default function EmergencyContacts() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Hotlines</Text>
      <FlatList 
        data={CONTACTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactRow}>
            <View>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
            <AppButton title="Call" onPress={() => Linking.openURL(`tel:${item.phone}`)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#d32f2f' },
  contactRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderColor: '#eee' },
  contactName: { fontSize: 18, fontWeight: '500' },
  phone: { color: '#666' }
});