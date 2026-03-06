// App.tsx - TradeEasy con React Navigation
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';
import { LessonScreen } from './src/screens/LessonScreen';
import { LevelMapScreen } from './src/screens/LevelMapScreen';
import { Lesson } from './src/types';
import { lessonsData } from './src/data/lessons';
import { COLORS } from './src/shared/constants';
import { useUserStore, useIsHydrated } from './src/store/userStore';

const Stack = createNativeStackNavigator();

// Componente que espera a que el store esté hidratado
function AppNavigator() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'lesson' | 'map'>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  
  const { loadProgress, lessonsCompleted, isHydrated } = useUserStore();

  useEffect(() => {
    // Cargar progreso al iniciar
    loadProgress();
  }, []);

  // Mostrar loading mientras se hidrata el store
  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const handleContinue = () => {
    for (const lesson of lessonsData) {
      if (!lessonsCompleted.includes(lesson.id)) {
        setSelectedLesson(lesson);
        setCurrentScreen('lesson');
        return;
      }
    }
    setCurrentScreen('map');
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentScreen('lesson');
  };

  const handleLessonComplete = () => {
    setSelectedLesson(null);
    setCurrentScreen('home');
  };

  const handleBack = () => {
    setSelectedLesson(null);
    setCurrentScreen('map');
  };

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      {currentScreen === 'home' && (
        <Stack.Screen name="Home">
          {() => (
            <HomeScreen 
              onContinue={handleContinue}
              onMap={() => setCurrentScreen('map')}
            />
          )}
        </Stack.Screen>
      )}
      
      {currentScreen === 'map' && (
        <Stack.Screen name="Map">
          {() => (
            <LevelMapScreen onSelectLesson={handleSelectLesson} />
          )}
        </Stack.Screen>
      )}
      
      {currentScreen === 'lesson' && selectedLesson && (
        <Stack.Screen name="Lesson">
          {() => (
            <LessonScreen 
              lesson={selectedLesson}
              onComplete={handleLessonComplete}
              onBack={handleBack}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
