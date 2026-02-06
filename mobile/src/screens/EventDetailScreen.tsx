import React from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackParamList } from "../../App";
import type { Event } from "../hooks/useEvents";

type EventDetailRouteProp = RouteProp<RootStackParamList, "EventDetail">;

export const EventDetailScreen: React.FC = () => {
  const route = useRoute<EventDetailRouteProp>();
  const event = route.params.event as Event;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{event.title}</Text>

      {(event.location || event.country) && (
        <Text style={styles.meta}>
          {[event.location, event.country].filter(Boolean).join(" • ")}
        </Text>
      )}

      {event.startDateTime && (
        <Text style={styles.date}>
          Start: {new Date(event.startDateTime).toLocaleString()}
        </Text>
      )}

      {event.endDateTime && (
        <Text style={styles.date}>
          End: {new Date(event.endDateTime).toLocaleString()}
        </Text>
      )}

      {event.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionBody}>{event.description}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  meta: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: "#94a3b8",
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionBody: {
    fontSize: 14,
    color: "#0f172a",
  },
});

