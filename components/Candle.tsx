'use client';

import React from 'react';

interface CandleProps {
  lit: boolean;
  label?: string;
  index?: number;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CONFIG = {
  sm: { height: 40, width: 20, flameScale: 0.7 },
  md: { height: 60, width: 28, flameScale: 1 },
  lg: { height: 80, width: 36, flameScale: 1.3 },
};

export default function Candle({ lit, label, index = 0, size = 'md' }: CandleProps) {
  const config = SIZE_CONFIG[size];
  const wickHeight = 8;
  const totalHeight = config.height + wickHeight + (lit ? 30 * config.flameScale : 0);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={config.width + 20}
        height={totalHeight + 10}
        viewBox={`0 0 ${config.width + 20} ${totalHeight + 10}`}
        className="overflow-visible"
      >
        <defs>
          {/* Flame gradient */}
          <linearGradient id={`flame-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Inner flame glow */}
          <radialGradient id={`inner-glow-${index}`}>
            <stop offset="0%" stopColor="#FEF9C3" stopOpacity="1" />
            <stop offset="50%" stopColor="#FCD34D" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>

          {/* Candle shadow */}
          <filter id={`candle-shadow-${index}`}>
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Flame glow effect */}
          {lit && (
            <filter id={`flame-glow-${index}`}>
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Outer glow when lit */}
        {lit && (
          <ellipse
            cx={(config.width + 20) / 2}
            cy={20}
            rx={config.width * 0.8}
            ry={config.width * 0.6}
            fill={`url(#inner-glow-${index})`}
            opacity="0.4"
            className="animate-glow-pulse"
            style={{ animationDelay: `${index * 0.15}s` }}
          />
        )}

        {/* Flame */}
        {lit && (
          <g
            className="animate-candle-flicker"
            style={{
              transformOrigin: `${(config.width + 20) / 2}px ${30 * config.flameScale}px`,
              animationDelay: `${index * 0.15}s`,
            }}
          >
            {/* Outer flame */}
            <path
              d={`M ${(config.width + 20) / 2} ${5 * config.flameScale}
                 C ${(config.width + 20) / 2 - 6 * config.flameScale} ${8 * config.flameScale},
                   ${(config.width + 20) / 2 - 8 * config.flameScale} ${15 * config.flameScale},
                   ${(config.width + 20) / 2 - 7 * config.flameScale} ${22 * config.flameScale}
                 C ${(config.width + 20) / 2 - 5 * config.flameScale} ${27 * config.flameScale},
                   ${(config.width + 20) / 2} ${30 * config.flameScale},
                   ${(config.width + 20) / 2} ${30 * config.flameScale}
                 C ${(config.width + 20) / 2} ${30 * config.flameScale},
                   ${(config.width + 20) / 2 + 5 * config.flameScale} ${27 * config.flameScale},
                   ${(config.width + 20) / 2 + 7 * config.flameScale} ${22 * config.flameScale}
                 C ${(config.width + 20) / 2 + 8 * config.flameScale} ${15 * config.flameScale},
                   ${(config.width + 20) / 2 + 6 * config.flameScale} ${8 * config.flameScale},
                   ${(config.width + 20) / 2} ${5 * config.flameScale} Z`}
              fill={`url(#flame-gradient-${index})`}
              filter={`url(#flame-glow-${index})`}
            />

            {/* Inner bright core */}
            <ellipse
              cx={(config.width + 20) / 2}
              cy={18 * config.flameScale}
              rx={3 * config.flameScale}
              ry={8 * config.flameScale}
              fill="#FEF9C3"
              opacity="0.9"
            />
          </g>
        )}

        {/* Wick */}
        <line
          x1={(config.width + 20) / 2}
          y1={30 * config.flameScale + wickHeight}
          x2={(config.width + 20) / 2}
          y2={30 * config.flameScale + wickHeight + wickHeight}
          stroke="#78350F"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Candle body */}
        <g
          filter={`url(#candle-shadow-${index})`}
          opacity={lit ? 1 : 0.5}
        >
          {/* Main candle shape - slightly tapered */}
          <path
            d={`M ${(config.width + 20 - config.width) / 2 + 2} ${30 * config.flameScale + wickHeight + wickHeight}
               L ${(config.width + 20 - config.width) / 2} ${30 * config.flameScale + wickHeight + wickHeight + config.height}
               Q ${(config.width + 20 - config.width) / 2} ${30 * config.flameScale + wickHeight + wickHeight + config.height + 3},
                 ${(config.width + 20) / 2} ${30 * config.flameScale + wickHeight + wickHeight + config.height + 3}
               Q ${(config.width + 20 + config.width) / 2} ${30 * config.flameScale + wickHeight + wickHeight + config.height + 3},
                 ${(config.width + 20 + config.width) / 2} ${30 * config.flameScale + wickHeight + wickHeight + config.height}
               L ${(config.width + 20 + config.width) / 2 - 2} ${30 * config.flameScale + wickHeight + wickHeight}
               Q ${(config.width + 20 + config.width) / 2 - 2} ${30 * config.flameScale + wickHeight + wickHeight - 3},
                 ${(config.width + 20) / 2} ${30 * config.flameScale + wickHeight + wickHeight - 3}
               Q ${(config.width + 20 - config.width) / 2 + 2} ${30 * config.flameScale + wickHeight + wickHeight - 3},
                 ${(config.width + 20 - config.width) / 2 + 2} ${30 * config.flameScale + wickHeight + wickHeight}
               Z`}
            fill="#FEF3C7"
          />

          {/* Candle highlight */}
          <rect
            x={(config.width + 20 - config.width) / 2 + 3}
            y={30 * config.flameScale + wickHeight + wickHeight + 5}
            width={config.width * 0.15}
            height={config.height * 0.7}
            rx="2"
            fill="#FFFBEB"
            opacity="0.6"
          />
        </g>
      </svg>

      {label && (
        <span className="text-xs font-inter text-amber-800 dark:text-amber-300 font-medium">
          {label}
        </span>
      )}
    </div>
  );
}
