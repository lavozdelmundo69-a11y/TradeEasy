// Índice de ejercicios chart-decision
export const CHART_DECISION_EXERCISES = [
  {
    id: 'ex_sr_01',
    type: 'chart-decision',
    concept: 'soporte_resistencia',
    question: '¿Qué harías cuando el precio toca esta zona de soporte?',
    chart: {
      timeframe: '1h',
      candles: [
        {time: 1, open: 1.085, high: 1.087, low: 1.0845, close: 1.0865},
        {time: 2, open: 1.0865, high: 1.088, low: 1.086, close: 1.0875},
        {time: 3, open: 1.0875, high: 1.089, low: 1.087, close: 1.0885},
        {time: 4, open: 1.0885, high: 1.09, low: 1.088, close: 1.0895},
        {time: 5, open: 1.0895, high: 1.091, low: 1.089, close: 1.0905},
        {time: 6, open: 1.0905, high: 1.0915, low: 1.0895, close: 1.09},
        {time: 7, open: 1.09, high: 1.0905, low: 1.0885, close: 1.089},
        {time: 8, open: 1.089, high: 1.0895, low: 1.0875, close: 1.088},
        {time: 9, open: 1.088, high: 1.0885, low: 1.0865, close: 1.087},
        {time: 10, open: 1.087, high: 1.0875, low: 1.086, close: 1.0865},
        {time: 11, open: 1.0865, high: 1.087, low: 1.0855, close: 1.086},
        {time: 12, open: 1.086, high: 1.0865, low: 1.085, close: 1.0855},
        {time: 13, open: 1.0855, high: 1.086, low: 1.0845, close: 1.085},
        {time: 14, open: 1.085, high: 1.0855, low: 1.084, close: 1.0845},
        {time: 15, open: 1.0845, high: 1.085, low: 1.0835, close: 1.084},
        {time: 16, open: 1.084, high: 1.0845, low: 1.083, close: 1.0835},
        {time: 17, open: 1.0835, high: 1.084, low: 1.0825, close: 1.083},
        {time: 18, open: 1.083, high: 1.0835, low: 1.082, close: 1.0825},
        {time: 19, open: 1.0825, high: 1.083, low: 1.0815, close: 1.082},
        {time: 20, open: 1.082, high: 1.0855, low: 1.0815, close: 1.085}
      ]
    },
    options: ['Comprar', 'Vender', 'Esperar'],
    correctAnswer: 2,
    difficulty: 'medium',
    result: {
      summary: 'La mejor opción era ESPERAR porque no hay confirmación de reversión.',
      analysis: 'El precio toca soporte pero no hay señal clara de reversión. Comprar en soporte sin confirmación es un error común.',
      commonMistake: 'Comprar inmediatamente al tocar soporte. Siempre espera una señal de confirmación.',
      lessonReference: 'Soporte y Resistencia'
    }
  }
];

export const getExerciseById = (id: string) => {
  return CHART_DECISION_EXERCISES.find(e => e.id === id);
};

export const getExercisesByConcept = (concept: string) => {
  return CHART_DECISION_EXERCISES.filter(e => e.concept === concept);
};
