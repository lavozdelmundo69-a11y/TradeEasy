# TradeEasy 📚₿

App móvil para aprender trading desde cero, estilo Duolingo.

## 🎯 Objetivo

Enseñar trading de forma progresiva, interactiva y gamificada. Contenido optimizado para sesiones cortas (2-5 min) en móvil.

---

## 📁 Estructura del Proyecto

```
TradeEasy/
├── PROMPT.md                    # Prompt original del proyecto
├── README.md                     # Este archivo
├── docs/
│   └── ARQUITECTURA.md          # Arquitectura técnica completa
├── data/
│   └── lessons/
│       ├── level1.json          # Nivel 1: Fundamentos (10 lecciones)
│       └── level2.json          # Nivel 2: Comprensión del Mercado (10 lecciones)
└── src/                         # Código fuente (por implementar)
    ├── components/
    ├── store/
    ├── hooks/
    └── types/
```

---

## 📚 Contenido Creado

### Nivel 1 - Fundamentos (10 lecciones)
1. ¿Qué es el Trading?
2. Los Mercados Financieros
3. ¿Qué es el Precio?
4. Velas Japonesas
5. Velas Alcistas y Bajistas
6. Partes de una Vela
7. Soportes y Resistencias
8. Tipos de Tendencia
9. El Volumen
10. Gestión del Riesgo

### Nivel 2 - Comprensión del Mercado (10 lecciones)
1. Estructura HH HL LH LL
2. Break of Structure (BOS)
3. Change of Character (CHoCH)
4. Zonas de Oferta y Demanda
5. Consolidaciones
6. Falsas Rupturas
7. Confluencias
8. Psicología del Trading
9. Liquidez
10. Contexto de Mercado

---

## 🏗️ Arquitectura Técnica

**Stack:**
- React Native + Expo
- TypeScript
- Zustand (state)
- Expo Router (navigation)
- Reanimated (animaciones)

**Ver:** `docs/ARQUITECTURA.md` para detalles completos.

---

## 🎮 Sistema de Gamificación

- **XP por lección:** 50-70 puntos
- **XP por ejercicio correcto:** 10 puntos
- **Bonus por racha:** 5 puntos/día
- **Niveles:** Novato → Aprendiz → Analista → Trader → Experto

---

## 🚀 Próximos Pasos

1. **Iniciar proyecto Expo** con la estructura diseñada
2. **Implementar componentes UI** básicos
3. **Crear navegación** entre pantallas
4. **Integrar datos de lecciones** (JSON ya listo)
5. **Implementar sistema de progreso** (Zustand + AsyncStorage)
6. **Añadir ejercicios interactivos**

---

## 💡 Notas

- El Nivel 3 (Conceptos Avanzados: Wyckoff, ICT, SMC) está pendiente de diseño
- El contenido está en español
- Formato optimizado para móviles (texto corto, ejercicios rápidos)
