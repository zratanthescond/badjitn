import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// NOTE:
// Your web app uses Clerk + MongoDB for user accounts. For mobile,
// you can integrate Clerk's React Native / Expo SDK and then call
// the existing /api/users?clerkId=... endpoint to fetch profile data.

export const ProfileScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>
        Hook this screen up to Clerk and your `/api/users` endpoint to mirror
        the full web profile experience.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coming soon</Text>
        <Text style={styles.cardBody}>
          This is a placeholder profile screen. Once you have mobile
          authentication in place, you can:
        </Text>
        <Text style={styles.bullet}>• Load the current user</Text>
        <Text style={styles.bullet}>• Show their events and orders</Text>
        <Text style={styles.bullet}>• Allow updating profile details</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  card: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 14,
    color: "#0f172a",
    marginBottom: 8,
  },
  bullet: {
    fontSize: 13,
    color: "#334155",
  },
});

