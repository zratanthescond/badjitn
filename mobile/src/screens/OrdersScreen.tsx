import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// NOTE:
// The web app exposes order management from the cockpit.
// To fully mirror it, expose an authenticated API route (e.g. /api/orders)
// and call it from here with the logged-in user's token.

export const OrdersScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Orders</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Orders not yet wired</Text>
        <Text style={styles.cardBody}>
          Add an orders API endpoint and use React Query here to list and manage
          the user's orders, mirroring the cockpit experience on the web.
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

