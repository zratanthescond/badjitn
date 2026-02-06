import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useEvents, Event } from "../hooks/useEvents";
import type { RootStackParamList } from "../../App";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");

  const { data, isLoading, refetch, isRefetching } = useEvents({
    page: 1,
    query: search,
    country,
  });

  const onPressEvent = (event: Event) => {
    navigation.navigate("EventDetail", { event });
  };

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => onPressEvent(item)}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      {item.location || item.country ? (
        <Text style={styles.eventMeta}>
          {[item.location, item.country].filter(Boolean).join(" • ")}
        </Text>
      ) : null}
      {item.startDateTime ? (
        <Text style={styles.eventDate}>
          {new Date(item.startDateTime).toLocaleString()}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.filtersRow}>
          <TextInput
            placeholder="Search events..."
            value={search}
            onChangeText={setSearch}
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={() => refetch()}
          />
          <TextInput
            placeholder="Country"
            value={country}
            onChangeText={setCountry}
            style={styles.input}
          />
          <Button title="Filter" onPress={() => refetch()} />
        </View>

        <View style={styles.actionsRow}>
          <Button
            title="Create event"
            onPress={() => navigation.navigate("CreateEvent")}
          />
          <Button
            title="Profile"
            onPress={() => navigation.navigate("Profile")}
          />
          <Button
            title="Support"
            onPress={() => navigation.navigate("Support")}
          />
        </View>

        {isLoading || isRefetching ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
            <Text style={styles.loaderText}>Loading events…</Text>
          </View>
        ) : (
          <FlatList
            data={data?.data ?? []}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No events found.</Text>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderText: {
    marginTop: 8,
    color: "#555",
  },
  listContent: {
    paddingBottom: 16,
  },
  eventCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  eventMeta: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 12,
    color: "#94a3b8",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#64748b",
  },
});

