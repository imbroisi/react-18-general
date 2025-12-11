import React, { useEffect, useRef } from 'react';
import { Checkbox, CheckboxProps } from '@mui/material';
import { SvgIcon } from '@mui/material';

// API exposta: estados "checked", "unchecked" e "halfchecked".
export type CaTripleState = 'checked' | 'unchecked' | 'halfchecked';

// Converte nomes de cores comuns para valores hexadecimais
const normalizeColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    'blue': '#1976d2',
    'red': '#d32f2f',
    'green': '#2e7d32',
    'orange': '#ed6c02',
    'purple': '#9c27b0',
  };
  return colorMap[color.toLowerCase()] || color;
};

type CaTripleStateCheckboxMUIProps = {
  state: CaTripleState;
  disabled?: boolean;
  indeterminateColor?: string; // Cor do sinal de menos
  borderColor?: string; // Cor da borda
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
} & Omit<CheckboxProps, 'checked' | 'indeterminate' | 'onChange' | 'indeterminateIcon'>;

// Ícone customizado para o estado indeterminate (sinal de menos)
const IndeterminateIcon: React.FC<{ color: string }> = ({ color }) => (
  <SvgIcon 
    viewBox="0 0 24 24"
    sx={{
      color: `${color} !important`,
      '& path': {
        fill: `${color} !important`,
      },
    }}
  >
    <path
      d="M19 13H5v-2h14v2z"
      fill={color}
      style={{ fill: color }}
    />
  </SvgIcon>
);

const CaTripleStateCheckboxMUI: React.FC<CaTripleStateCheckboxMUIProps> = ({
  state,
  disabled = false,
  indeterminateColor = '#1976d2', // Cor padrão azul do MUI
  borderColor,
  onChange,
  ...otherProps
}) => {
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const isChecked = state === 'checked';
  const isIndeterminate = state === 'halfchecked';
  const normalizedColor = normalizeColor(indeterminateColor);

  useEffect(() => {
    if (isIndeterminate && checkboxRef.current) {
      const timer = setTimeout(() => {
        const svgIcon = checkboxRef.current?.querySelector('.MuiSvgIcon-root') as SVGElement;
        if (svgIcon) {
          svgIcon.style.color = normalizedColor;
          svgIcon.setAttribute('style', `color: ${normalizedColor} !important;`);
          
          const paths = svgIcon.querySelectorAll('path');
          paths.forEach((path) => {
            path.setAttribute('fill', normalizedColor);
            path.setAttribute('style', `fill: ${normalizedColor} !important;`);
          });
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [isIndeterminate, normalizedColor]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    onChange?.(checked, event);
  };

  return (
    <Checkbox
      ref={checkboxRef}
      checked={isChecked}
      indeterminate={isIndeterminate}
      disabled={disabled}
      onChange={handleChange}
      indeterminateIcon={<IndeterminateIcon color={normalizedColor} />}
      sx={{
        ...(isIndeterminate && {
          '& .MuiSvgIcon-root': {
            color: `${normalizedColor} !important`,
            '& path': {
              fill: `${normalizedColor} !important`,
            },
          },
        }),
        ...(borderColor && {
          '& .MuiSvgIcon-root': {
            border: `2px solid ${borderColor}`,
            borderRadius: '4px',
            boxSizing: 'border-box',
          },
        }),
        ...otherProps.sx,
      }}
      aria-label={`ca triple state checkbox (${state}${disabled ? ', disabled' : ''})`}
      {...otherProps}
    />
  );
};

export default CaTripleStateCheckboxMUI;

