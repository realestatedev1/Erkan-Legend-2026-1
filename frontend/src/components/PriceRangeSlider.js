import React, { useState, useEffect, useCallback } from 'react';

const PriceRangeSlider = ({ 
  min = 0, 
  max = 50000000, 
  minValue, 
  maxValue, 
  onChange,
  step = 100000,
  formatValue = (v) => `${(v / 1000000).toFixed(1)}M`
}) => {
  const [localMin, setLocalMin] = useState(minValue || min);
  const [localMax, setLocalMax] = useState(maxValue || max);

  useEffect(() => {
    setLocalMin(minValue || min);
    setLocalMax(maxValue || max);
  }, [minValue, maxValue, min, max]);

  const handleMinChange = (e) => {
    const value = Math.min(Number(e.target.value), localMax - step);
    setLocalMin(value);
  };

  const handleMaxChange = (e) => {
    const value = Math.max(Number(e.target.value), localMin + step);
    setLocalMax(value);
  };

  const handleMouseUp = useCallback(() => {
    if (onChange) {
      onChange({ min: localMin, max: localMax });
    }
  }, [localMin, localMax, onChange]);

  // Calculate percentages for styling
  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  const formatDisplayPrice = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ₺`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K ₺`;
    }
    return `${value} ₺`;
  };

  return (
    <div className="w-full px-2">
      {/* Labels */}
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {formatDisplayPrice(localMin)}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {formatDisplayPrice(localMax)}
        </span>
      </div>

      {/* Slider Container */}
      <div className="relative h-2">
        {/* Track background */}
        <div className="absolute w-full h-2 bg-gray-200 rounded-full"></div>
        
        {/* Active track */}
        <div 
          className="absolute h-2 bg-red-500 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`
          }}
        ></div>

        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-red-500
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:bg-red-50
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-red-500
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer"
        />

        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxChange}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-red-500
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:hover:bg-red-50
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-red-500
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>

      {/* Quick select buttons */}
      <div className="flex flex-wrap gap-1 mt-4">
        {[
          { label: '< 1M', min: 0, max: 1000000 },
          { label: '1-3M', min: 1000000, max: 3000000 },
          { label: '3-5M', min: 3000000, max: 5000000 },
          { label: '5-10M', min: 5000000, max: 10000000 },
          { label: '10M+', min: 10000000, max: 50000000 },
        ].map((range) => (
          <button
            key={range.label}
            type="button"
            onClick={() => {
              setLocalMin(range.min);
              setLocalMax(range.max);
              if (onChange) {
                onChange({ min: range.min, max: range.max });
              }
            }}
            className={`px-2 py-1 text-xs rounded border transition ${
              localMin === range.min && localMax === range.max
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriceRangeSlider;
