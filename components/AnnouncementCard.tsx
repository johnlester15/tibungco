import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function AnnouncementCard({ title, description, date, id }) {
  return (
    <Link href={`/announcement/${id}`} asChild>
      <TouchableOpacity style={styles.card}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, elevation: 3 },
  date: { fontSize: 12, color: '#666' },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 5 },
  description: { fontSize: 14, color: '#444' }
});