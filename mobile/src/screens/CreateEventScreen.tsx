import React from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../../App";
import { useCreateEvent } from "../hooks/useCreateEvent";

type Nav = NativeStackNavigationProp<RootStackParamList, "CreateEvent">;

export const CreateEventScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [country, setCountry] = React.useState("");

  const { mutateAsync, isPending } = useCreateEvent();

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a title for your event.");
      return;
    }

    try {
      await mutateAsync({
        title: title.trim(),
        description: description.trim(),
        locationName: location.trim(),
        country: country.trim(),
      });

      Alert.alert("Success", "Event created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.message ??
          "An error occurred while creating the event. Make sure you are signed in and try again."
      );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create event</Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <TextInput
        placeholder="Country"
        value={country}
        onChangeText={setCountry}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, styles.textArea]}
        multiline
      />

      <View style={styles.buttonWrapper}>
        <Button title={isPending ? "Creating..." : "Create event"} onPress={onSubmit} />
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
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "#ffffff",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  buttonWrapper: {
    marginTop: 8,
  },
});

