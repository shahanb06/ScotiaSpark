import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, StyleSheet } from 'react-native';
import { BookOpen, Home, Sparkles, User, Users } from 'lucide-react-native';
import { colors, typography } from '../theme';

import { SparkFeedScreen } from '../screens/tabs/SparkFeedScreen';
import { AccountScreen } from '../screens/tabs/AccountScreen';
import { LearnScreen } from '../screens/tabs/LearnScreen';
import { CirclesScreen } from '../screens/tabs/CirclesScreen';
import { ProfileScreen } from '../screens/tabs/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabIcon({ name, color }: { name: string; color: string }) {
  const props = { color, size: 22, strokeWidth: 2 };

  switch (name) {
    case 'AccountTab':
      return <Home {...props} />;
    case 'Learn':
      return <BookOpen {...props} />;
    case 'Spark':
      return <Sparkles {...props} />;
    case 'Circles':
      return <Users {...props} />;
    case 'Profile':
      return <User {...props} />;
    default:
      return null;
  }
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.scotiaRed,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarLabelPosition: 'below-icon',
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: ({ color }) => <TabIcon name={route.name} color={color} />,
      })}
    >
      <Tab.Screen
        name="AccountTab"
        component={AccountScreen}
        options={{ tabBarLabel: 'Accounts' }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{ tabBarLabel: 'Learn' }}
      />
      <Tab.Screen
        name="Spark"
        component={SparkFeedScreen}
        options={{ tabBarLabel: 'Spark' }}
      />
      <Tab.Screen
        name="Circles"
        component={CirclesScreen}
        options={{ tabBarLabel: 'Circles' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    height: 88,
    paddingTop: 8,
    paddingBottom: 22,
    ...(Platform.OS === 'web' ? { alignSelf: 'center', maxWidth: 430, width: '100%' } : null),
  },
  tabItem: {
    minWidth: 70,
    paddingTop: 4,
  },
  tabLabel: {
    ...typography.tabLabel,
    fontSize: 10,
    lineHeight: 13,
    marginTop: 3,
    textAlign: 'center',
    width: 70,
  },
});
