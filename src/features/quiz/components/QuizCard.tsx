// QuizCard con Feedback Educativo Mejorado
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, ScrollView, Dimensions } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../../shared/constants';
import { Exercise, ExerciseFeedback } from '../../../types';
import { CandlestickChart } from '../../trading/components/CandlestickChart';

const { width } = Dimensions.get('window');

interface QuizCardProps {
  exercise: Exercise;
  onAnswer: (selectedIndex: number) => void;
  showTimer?: boolean;
  timeLimit?: number;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  exercise,
  onAnswer,
  showTimer = false,
  timeLimit = 30,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Feedback de la respuesta
  const feedback = exercise.feedback;
  const isCorrect = selectedIndex === exercise.correctAnswer;

  const handleSelect = useCallback((index: number) => {
    if (showResult) return;
    
    // Vibración según resultado
    if (index === exercise.correctAnswer) {
      Vibration.vibrate(50);
    } else {
      Vibration.vibrate([0, 50, 50, 50]);
    }
    
    setSelectedIndex(index);
    setShowResult(true);
    
    setTimeout(() => {
      onAnswer(index);
    }, 4000); // Más tiempo para leer el feedback
  }, [showResult, exercise.correctAnswer, onAnswer]);

  // Timer
  useEffect(() => {
    if (!showTimer || showResult) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSelect(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showTimer, showResult, handleSelect]);

  const getButtonStyle = (index: number) => {
    if (!showResult) {
      return selectedIndex === index 
        ? [styles.buttonBase, styles.buttonSelected] 
        : [styles.buttonBase, styles.button];
    }
    
    if (index === exercise.correctAnswer) {
      return [styles.buttonBase, styles.buttonCorrect];
    }
    
    if (selectedIndex === index && index !== exercise.correctAnswer) {
      return [styles.buttonBase, styles.buttonWrong];
    }
    
    return [styles.buttonBase, styles.buttonDimmed];
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Timer */}
      {showTimer && !showResult && (
        <View style={[styles.timer, timeLeft <= 10 && styles.timerWarning]}>
          <Text style={styles.timerText}>⏱️ {timeLeft}s</Text>
        </View>
      )}

      {/* Pregunta */}
      <View style={styles.questionContainer}>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>
            {exercise.difficulty === 'easy' ? '🟢 Básico' : 
             exercise.difficulty === 'medium' ? '🟡 Intermedio' : '🔴 Avanzado'}
          </Text>
          <Text style={styles.topicBadge}>📚 {exercise.topic}</Text>
        </View>
        <Text style={styles.question}>{exercise.question}</Text>
        
        {exercise.scenario && (
          <View style={styles.scenario}>
            <Text style={styles.scenarioText}>{exercise.scenario.description}</Text>
          </View>
        )}
        
        {/* Gráfico para preguntas visuales */}
        {exercise.chart && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartLabel}>📊 Análisis Visual</Text>
            <CandlestickChart 
              data={[...exercise.chart.candles]}
              width={width - SPACING.md * 4}
              height={180}
              showVolume={false}
            />
            {exercise.chart.trend && (
              <Text style={styles.chartTrend}>
                {exercise.chart.trend === 'up' ? '📈 Tendencia Alcista' : 
                 exercise.chart.trend === 'down' ? '📉 Tendencia Bajista' : 
                 '➡️ Mercado Lateral'}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Opciones */}
      <View style={styles.optionsContainer}>
        {exercise.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getButtonStyle(index) as any}
            onPress={() => handleSelect(index)}
            disabled={showResult}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.buttonText,
              showResult && index === exercise.correctAnswer && styles.buttonTextCorrect,
              showResult && selectedIndex === index && index !== exercise.correctAnswer && styles.buttonTextWrong,
              showResult && index !== exercise.correctAnswer && selectedIndex !== index && styles.buttonTextDimmed,
            ]}>
              {option}
            </Text>
            {showResult && index === exercise.correctAnswer && (
              <Text style={styles.correctIcon}>✓</Text>
            )}
            {showResult && selectedIndex === index && index !== exercise.correctAnswer && (
              <Text style={styles.wrongIcon}>✗</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Feedback Educativo */}
      {showResult && feedback && (
        <View style={[
          styles.feedbackContainer,
          isCorrect ? styles.feedbackCorrect : styles.feedbackWrong
        ]}>
          {/* Header */}
          <View style={styles.feedbackHeader}>
            <Text style={[
              styles.feedbackTitle,
              isCorrect ? styles.feedbackTitleCorrect : styles.feedbackTitleWrong
            ]}>
              {isCorrect ? '🎉 ¡Correcto!' : '💡 Mmm, no exactamente'}
            </Text>
          </View>

          {/* Explicación corta */}
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackLabel}>📖 Explicación</Text>
            <Text style={styles.feedbackText}>{feedback.shortExplanation}</Text>
          </View>

          {/* Por qué cada opción */}
          {feedback.optionExplanations && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>🔍 Análisis de opciones</Text>
              {feedback.optionExplanations.map((opt, idx) => (
                <View key={idx} style={styles.optionAnalysis}>
                  <Text style={[
                    styles.optionCorrectness,
                    opt.isCorrect ? styles.optionCorrect : styles.optionIncorrect
                  ]}>
                    {opt.isCorrect ? '✓' : '✗'} {exercise.options[opt.optionIndex]}
                  </Text>
                  <Text style={styles.optionExplanation}>{opt.explanation}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Error común */}
          {feedback.commonMistake && !isCorrect && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>⚠️ Error común</Text>
              <View style={styles.commonMistakeBox}>
                <Text style={styles.commonMistakeTitle}>{feedback.commonMistake.title}</Text>
                <Text style={styles.commonMistakeText}>{feedback.commonMistake.whyWrong}</Text>
              </View>
            </View>
          )}

          {/* Consejo */}
          {feedback.tip && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>💡 Consejo</Text>
              <Text style={styles.tipText}>{feedback.tip}</Text>
            </View>
          )}

          {/* Contexto de mercado */}
          {feedback.marketContext && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>📊 Contexto del mercado</Text>
              <Text style={styles.marketContextText}>{feedback.marketContext}</Text>
            </View>
          )}

          {/* Lecciones relacionadas */}
          {exercise.relatedLessons && exercise.relatedLessons.length > 0 && (
            <View style={styles.feedbackSection}>
              <Text style={styles.feedbackLabel}>📚 Lecciones relacionadas</Text>
              <View style={styles.relatedLessonsBox}>
                {exercise.relatedLessons.map((lessonId, idx) => (
                  <Text key={idx} style={styles.relatedLessonLink}>→ {lessonId}</Text>
                ))}
              </View>
            </View>
          )}

          {/* Botón continuar */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => onAnswer(selectedIndex || -1)}
          >
            <Text style={styles.continueButtonText}>Continuar →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: SPACING.lg },
  timer: { alignSelf: 'flex-end', backgroundColor: COLORS.background, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full, marginBottom: SPACING.md },
  timerWarning: { backgroundColor: COLORS.errorLight },
  timerText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontWeight: '600' },
  questionContainer: { marginBottom: SPACING.lg },
  difficultyBadge: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  difficultyText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  topicBadge: { fontSize: FONT_SIZES.xs, color: COLORS.primary, fontWeight: '600' },
  question: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, lineHeight: 26 },
  scenario: { backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.md, borderLeftWidth: 4, borderLeftColor: COLORS.primary },
  chartContainer: { backgroundColor: COLORS.background, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, marginTop: SPACING.md },
  chartLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.xs },
  chartTrend: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: SPACING.xs, textAlign: 'center' },
  scenarioText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight, fontStyle: 'italic', lineHeight: 20 },
  optionsContainer: { gap: SPACING.sm },
  buttonBase: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md, borderWidth: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  button: { backgroundColor: COLORS.surface, borderColor: COLORS.background },
  buttonSelected: { backgroundColor: COLORS.surface, borderColor: COLORS.primary },
  buttonCorrect: { backgroundColor: COLORS.successLight, borderColor: COLORS.success },
  buttonWrong: { backgroundColor: COLORS.errorLight, borderColor: COLORS.error },
  buttonDimmed: { backgroundColor: COLORS.background, borderColor: COLORS.background, opacity: 0.7 },
  buttonText: { fontSize: FONT_SIZES.md, color: COLORS.text, flex: 1 },
  buttonTextCorrect: { fontSize: FONT_SIZES.md, color: COLORS.success, fontWeight: '600', flex: 1 },
  buttonTextWrong: { fontSize: FONT_SIZES.md, color: COLORS.error, flex: 1 },
  buttonTextDimmed: { fontSize: FONT_SIZES.md, color: COLORS.textMuted, flex: 1 },
  correctIcon: { fontSize: FONT_SIZES.lg, color: COLORS.success, fontWeight: 'bold' },
  wrongIcon: { fontSize: FONT_SIZES.lg, color: COLORS.error, fontWeight: 'bold' },
  // Feedback
  feedbackContainer: { marginTop: SPACING.lg, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg },
  feedbackCorrect: { backgroundColor: COLORS.successLight },
  feedbackWrong: { backgroundColor: COLORS.warningLight },
  feedbackHeader: { marginBottom: SPACING.md },
  feedbackTitle: { fontSize: FONT_SIZES.lg, fontWeight: 'bold' },
  feedbackTitleCorrect: { color: COLORS.success },
  feedbackTitleWrong: { color: '#D68910' },
  feedbackSection: { marginTop: SPACING.md },
  feedbackLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  feedbackText: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },
  optionAnalysis: { marginTop: SPACING.xs, paddingLeft: SPACING.sm },
  optionCorrectness: { fontSize: FONT_SIZES.sm, fontWeight: '600' },
  optionCorrect: { color: COLORS.success },
  optionIncorrect: { color: COLORS.error },
  optionExplanation: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  commonMistakeBox: { backgroundColor: COLORS.surface, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, borderLeftWidth: 3, borderLeftColor: COLORS.error },
  commonMistakeTitle: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.error },
  commonMistakeText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 4 },
  tipText: { fontSize: FONT_SIZES.sm, color: COLORS.text, fontStyle: 'italic' },
  marketContextText: { fontSize: FONT_SIZES.sm, color: COLORS.textLight },
  relatedLessonsBox: { backgroundColor: COLORS.surface, padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm },
  relatedLessonLink: { fontSize: FONT_SIZES.sm, color: COLORS.primary, marginVertical: 2 },
  continueButton: { marginTop: SPACING.lg, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  continueButtonText: { color: COLORS.textInverse, fontSize: FONT_SIZES.md, fontWeight: '700' },
});
