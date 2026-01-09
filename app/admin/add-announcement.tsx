import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import AppButton from '../../components/AppButton';

// API URL (override with EXPO_PUBLIC_API_URL in production/dev)
const API_URL = (process.env?.EXPO_PUBLIC_API_URL) || 'https://tibungco.vercel.app';

export default function AddAnnouncement() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Required', 'Please enter title and message');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          details: message.trim(),
          type: 'Announcement',
          scheduled_date: new Date().toISOString(),
          author_name: 'Barangay Admin'
        })
      });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        Alert.alert('Success', 'Announcement posted to Barangay Tibungco feed!');
        setTitle(''); setMessage('');
        // Navigate back to home which will refresh announcements
        router.push('/(tabs)/home');
      } else {
        Alert.alert('Error', json?.error || json?.message || `Server responded ${res.status}`);
      }
    } catch (err) {
      console.error('Post announcement failed', err);
      Alert.alert('Error', 'Could not reach server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Announcement Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter title..." />
      
      <Text style={styles.label}>Message</Text>
      <TextInput style={[styles.input, { height: 100 }]} multiline value={message} onChangeText={setMessage} placeholder="Enter message details..." />
      
      <AppButton title="Post Announcement" onPress={handleSubmit} color="#0056b3" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 20, backgroundColor: '#fff' }
});