import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';

// Import screens
import LoopPadScreen from '../screens/LoopPadScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TrackDetailScreen from '../screens/TrackDetailScreen';
import SoundPacksScreen from '../screens/SoundPacksScreen';
import ProjectListScreen from '../screens/ProjectListScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function StudioStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="LoopPad" 
        component={LoopPadScreen}
        options={{ title: 'Studio' }}
      />
      <Stack.Screen 
        name="SoundPacks" 
        component={SoundPacksScreen}
        options={{ title: 'Sound Packs' }}
      />
      <Stack.Screen 
        name="ProjectList" 
        component={ProjectListScreen}
        options={{ title: 'My Projects' }}
      />
    </Stack.Navigator>
  );
}

function FeedStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="Discover" 
        component={DiscoverScreen}
        options={{ title: 'Discover' }}
      />
      <Stack.Screen 
        name="TrackDetail" 
        component={TrackDetailScreen}
        options={{ title: 'Track' }}
      />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'musical-notes';

            if (route.name === 'Studio') {
              iconName = focused ? 'grid' : 'grid-outline';
            } else if (route.name === 'Feed') {
              iconName = focused ? 'compass' : 'compass-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.card,
            borderTopWidth: 1,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Studio" component={StudioStack} />
        <Tab.Screen name="Feed" component={FeedStack} />
        <Tab.Screen name="Profile" component={ProfileStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
