// App.tsx - TradeEasy MVP

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { HomeScreen, LessonScreen, LevelMapScreen } from './src/screens';
import { Lesson } from './src/types';
import { lessonsData } from './src/data/lessons';
import { COLORS } from './src/constants';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'lesson' | 'map'>('home');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const handleContinue = () => {
    // Encontrar siguiente lección
    const { lessonsCompleted } = require('./src/store/userStore').useUserStore.getState();
    
    for (const lesson of lessonsData) {
      if (!lessonsCompleted.includes(lesson.id)) {
        setSelectedLesson(lesson);
        setCurrentScreen('lesson');
        return;
      }
    }
    
    // Si completó todo, ir al mapa
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {currentScreen === 'home' && (
        <HomeScreen 
          onContinue={handleContinue}
          onMap={() => setCurrentScreen('map')}
        />
      )}
      
      {currentScreen === 'map' && (
        <LevelMapScreen onSelectLesson={handleSelectLesson} />
      )}
      
      {currentScreen === 'lesson' && selectedLesson && (
        <LessonScreen 
          lesson={selectedLesson}
          onComplete={handleLessonComplete}
          onBack={handleBack}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
