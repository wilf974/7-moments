'use client';

import React from 'react';
import Candle from './Candle';

interface CandleRowProps {
  count: number;
}

const CANONICAL_HOURS = [
  { name: "Vigiles", hour: 3 },
  { name: "Laudes", hour: 6 },
  { name: "Tierce", hour: 9 },
  { name: "Sexte", hour: 12 },
  { name: "None", hour: 15 },
  { name: "Vêpres", hour: 18 },
  { name: "Complies", hour: 21 },
];

export default function CandleRow({ count }: CandleRowProps) {
  return (
    <div className="flex justify-center items-end gap-2 md:gap-4">
      {CANONICAL_HOURS.map((hour, index) => (
        <Candle
          key={hour.name}
          lit={index < count}
          label={hour.name}
          index={index}
          size="md"
        />
      ))}
    </div>
  );
}
