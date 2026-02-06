import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// This screen mirrors the idea of the /support and /help pages on the web.
// You can expand it with categories, FAQs, contact forms, etc.,
// calling any existing support/help endpoints you have.

export const SupportScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Support</Text>
      <Text style={styles.subtitle}>
        Get help with your events, tickets and payments.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact support</Text>
        <Text style={styles.cardBody}>
          Reuse the same support channels you expose on the web (email, chat,
          phone) and surface them here so users can reach you from the app.
        </Text>
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
  },
});

