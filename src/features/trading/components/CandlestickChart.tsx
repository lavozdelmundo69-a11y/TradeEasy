// Componente de Gráfico de Velas Japonesas
import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Text, Dimensions, ScrollView } from 'react-native';
import Svg, { Rect, Line, G, Text as SvgText } from 'react-native-svg';
import { Candle } from '../../../types';
import { COLORS, SPACING, FONT_SIZES } from '../../../shared/constants';

interface CandlestickChartProps {
  data: Candle[];
  width?: number;
  height?: number;
  candleWidth?: number;
  candleSpacing?: number;
  showVolume?: boolean;
  supportLevels?: number[];
  resistanceLevels?: number[];
  showGrid?: boolean;
  showPriceLabels?: boolean;
  highlightCandle?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  height = 300,
  candleWidth = 8,
  candleSpacing = 2,
  showVolume = true,
  supportLevels = [],
  resistanceLevels = [],
  showGrid = true,
  showPriceLabels = true,
  highlightCandle,
}) => {
  const chartHeight = showVolume ? height * 0.7 : height;
  const volumeHeight = showVolume ? height * 0.25 : 0;
  const priceLabelWidth = 45;

  // Calcular rango de precios
  const { minPrice, maxPrice, priceRange, minVolume, maxVolume } = useMemo(() => {
    const prices = data.flatMap(c => [c.high, c.low]);
    const volumes = data.map(c => c.volume || 0);
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      priceRange: max - min + padding * 2,
      minVolume: Math.min(...volumes) || 0,
      maxVolume: Math.max(...volumes) || 1,
    };
  }, [data]);

  const totalCandleWidth = candleWidth + candleSpacing;
  const chartWidth = Math.max(data.length * totalCandleWidth + priceLabelWidth, SCREEN_WIDTH);

  // Funciones de conversión
  const getY = useCallback((price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  }, [minPrice, priceRange, chartHeight]);

  const getVolumeY = useCallback((volume: number) => {
    if (!showVolume) return 0;
    const normalizedVolume = (volume - minVolume) / (maxVolume - minVolume);
    return chartHeight + volumeHeight - normalizedVolume * volumeHeight;
  }, [minVolume, maxVolume, showVolume, volumeHeight, chartHeight]);

  // Renderizar una vela
  const renderCandle = useCallback((candle: Candle, index: number) => {
    const isGreen = candle.close >= candle.open;
    const color = isGreen ? COLORS.candleGreen : COLORS.candleRed;
    const isHighlighted = highlightCandle === index;
    
    const x = index * totalCandleWidth + priceLabelWidth;
    const bodyTop = getY(Math.max(candle.open, candle.close));
    const bodyHeight = Math.max(1, Math.abs(getY(candle.close) - getY(candle.open)));
    const wickTop = getY(candle.high);
    const wickBottom = getY(candle.low);
    
    return (
      <G key={index}>
        {/* Mecha superior */}
        <Line
          x1={x + candleWidth / 2}
          y1={wickTop}
          x2={x + candleWidth / 2}
          y2={bodyTop}
          stroke={color}
          strokeWidth={1}
        />
        {/* Mecha inferior */}
        <Line
          x1={x + candleWidth / 2}
          y1={bodyTop + bodyHeight}
          x2={x + candleWidth / 2}
          y2={wickBottom}
          stroke={color}
          strokeWidth={1}
        />
        {/* Cuerpo de la vela */}
        <Rect
          x={x}
          y={bodyTop}
          width={candleWidth}
          height={bodyHeight}
          fill={color}
          stroke={isHighlighted ? COLORS.warning : color}
          strokeWidth={isHighlighted ? 2 : 1}
          rx={1}
        />
        {/* Volumen */}
        {showVolume && candle.volume && (
          <Rect
            x={x + 1}
            y={getVolumeY(candle.volume)}
            width={candleWidth - 2}
            height={chartHeight + volumeHeight - getVolumeY(candle.volume)}
            fill={color}
            opacity={0.3}
            rx={1}
          />
        )}
      </G>
    );
  }, [totalCandleWidth, priceLabelWidth, candleWidth, getY, getVolumeY, showVolume, highlightCandle, chartHeight, volumeHeight]);

  // Renderizar líneas de soporte/resistencia
  const renderLevel = useCallback((level: number, type: 'support' | 'resistance') => {
    const y = getY(level);
    const color = type === 'support' ? COLORS.supportLine : COLORS.resistanceLine;
    
    return (
      <G key={`${type}-${level}`}>
        <Line
          x1={priceLabelWidth}
          y1={y}
          x2={chartWidth}
          y2={y}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="6,4"
          opacity={0.7}
        />
        {showPriceLabels && (
          <Rect
            x={2}
            y={y - 10}
            width={priceLabelWidth - 6}
            height={20}
            fill={color}
            rx={4}
          />
        )}
        {showPriceLabels && (
          <SvgText
            x={priceLabelWidth / 2}
            y={y + 4}
            fill="white"
            fontSize={9}
            textAnchor="middle"
          >
            {level.toFixed(2)}
          </SvgText>
        )}
      </G>
    );
  }, [getY, chartWidth, priceLabelWidth, showPriceLabels]);

  // Grid
  const renderGrid = useCallback(() => {
    if (!showGrid) return null;
    
    const lines = [];
    const priceSteps = 5;
    const priceStep = priceRange / priceSteps;
    
    for (let i = 0; i <= priceSteps; i++) {
      const price = minPrice + priceStep * i;
      const y = getY(price);
      lines.push(
        <Line
          key={`grid-${i}`}
          x1={priceLabelWidth}
          y1={y}
          x2={chartWidth}
          y2={y}
          stroke={COLORS.gridLine}
          strokeWidth={0.5}
          opacity={0.2}
        />
      );
    }
    
    return <G>{lines}</G>;
  }, [showGrid, minPrice, priceRange, getY, chartWidth, priceLabelWidth]);

  // Etiquetas de precio a la izquierda
  const renderPriceLabels = useCallback(() => {
    if (!showPriceLabels) return null;
    
    const labels = [];
    const priceSteps = 5;
    const priceStep = priceRange / priceSteps;
    
    for (let i = 0; i <= priceSteps; i++) {
      const price = minPrice + priceStep * i;
      const y = getY(price);
      labels.push(
        <SvgText
          key={`label-${i}`}
          x={priceLabelWidth - 5}
          y={y + 4}
          fill={COLORS.textLight}
          fontSize={10}
          textAnchor="end"
        >
          {price.toFixed(2)}
        </SvgText>
      );
    }
    
    return <Svg>{labels}</Svg>;
  }, [showPriceLabels, minPrice, priceRange, getY, priceLabelWidth]);

  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>No hay datos</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={[styles.container, { height }]}
    >
      <Svg width={chartWidth} height={height}>
        {/* Grid */}
        {renderGrid()}
        
        {/* Soportes */}
        {supportLevels.map(level => renderLevel(level, 'support'))}
        
        {/* Resistencias */}
        {resistanceLevels.map(level => renderLevel(level, 'resistance'))}
        
        {/* Velas */}
        {data.map(renderCandle)}
      </Svg>
      
      {/* Etiquetas de precio (overlay) */}
      <View style={[styles.priceLabels, { height: chartHeight }]}>
        {renderPriceLabels()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZES.md,
    textAlign: 'center',
    marginTop: 100,
  },
  priceLabels: {
    position: 'absolute',
    left: SPACING.xs,
    top: 0,
  },
});

// Componente mini para previews
export const MiniCandlestickChart: React.FC<{ 
  data: Candle[]; 
  width?: number; 
  height?: number;
}> = ({ data, width = 120, height = 40 }) => {
  if (data.length === 0) return null;
  
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = data.flatMap(c => [c.high, c.low]);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
    };
  }, [data]);

  const range = maxPrice - minPrice || 1;
  
  return (
    <View style={[stylesMini.miniContainer, { width, height }]}>
      <Svg width={width} height={height}>
        {data.slice(-20).map((candle, index) => {
          const isGreen = candle.close >= candle.open;
          const color = isGreen ? COLORS.candleGreen : COLORS.candleRed;
          const x = (index / 20) * width;
          const w = width / 20 - 1;
          const y1 = height - ((candle.high - minPrice) / range) * height;
          const y2 = height - ((candle.low - minPrice) / range) * height;
          const y3 = height - ((candle.open - minPrice) / range) * height;
          const y4 = height - ((candle.close - minPrice) / range) * height;
          
          return (
            <G key={index}>
              <Line x1={x + w/2} y1={y1} x2={x + w/2} y2={y2} stroke={color} strokeWidth={1} />
              <Rect x={x} y={Math.min(y3, y4)} width={w} height={Math.max(1, Math.abs(y4 - y3))} fill={color} />
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

const stylesMini = StyleSheet.create({
  miniContainer: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
