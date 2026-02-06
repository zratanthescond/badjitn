import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { HomeScreen } from "./src/screens/HomeScreen";
import { EventDetailScreen } from "./src/screens/EventDetailScreen";
import { CreateEventScreen } from "./src/screens/CreateEventScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { SupportScreen } from "./src/screens/SupportScreen";

export type RootStackParamList = {
  Home: undefined;
  EventDetail: { event: any };
  CreateEvent: undefined;
  Profile: undefined;
  Orders: undefined;
  Support: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Badgi.net" }}
          />
          <Stack.Screen
            name="EventDetail"
            component={EventDetailScreen}
            options={{ title: "Event details" }}
          />
          <Stack.Screen
            name="CreateEvent"
            component={CreateEventScreen}
            options={{ title: "Create event" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Profile" }}
          />
          <Stack.Screen
            name="Orders"
            component={OrdersScreen}
            options={{ title: "Orders" }}
          />
          <Stack.Screen
            name="Support"
            component={SupportScreen}
            options={{ title: "Support" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
