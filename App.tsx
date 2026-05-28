import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from '@expo-google-fonts/nunito-sans';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { NunitoSans_400Regular, NunitoSans_500Medium, NunitoSans_600SemiBold } from '@expo-google-fonts/nunito-sans';
import { LibreBaskerville_400Regular, LibreBaskerville_700Bold } from '@expo-google-fonts/libre-baskerville';
import { RobotoMono_400Regular, RobotoMono_500Medium } from '@expo-google-fonts/roboto-mono';
import { DemoProvider } from './src/store/DemoContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    Frutiger: NunitoSans_400Regular,
    FrutigerMedium: NunitoSans_500Medium,
    FrutigerBold: NunitoSans_600SemiBold,
    ITCCentury: LibreBaskerville_400Regular,
    ITCCenturyBold: LibreBaskerville_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    LibreBaskerville_400Regular,
    LibreBaskerville_700Bold,
    RobotoMono_400Regular,
    RobotoMono_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#EC111A" />
      </View>
    );
  }

  return (
    <DemoProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <AppNavigator />
      </NavigationContainer>
    </DemoProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
