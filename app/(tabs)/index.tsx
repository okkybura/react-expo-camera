import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { ThemedView } from '@/components/ThemedView';

import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.pageContainer}>
      <Link href="/camera" asChild>
        <TouchableOpacity>
          <Text style={styles.btnText}>Open Camera</Text>
        </TouchableOpacity>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },

  btnText: {
    color: '#FFFFFF',
  }
});
