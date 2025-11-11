import React from 'react';
import Tooltip from '@mui/material/Tooltip';

// Personalization constants (defaults)
const COLOR = '#FFFFFF';
const BORDER_COLOR = '#E0E0E0';
// rgba(r,g,b,a) suggestion for a subtle shadow color
const BORDER_SHADOW = '0,0,0,0.12';
// Suggested shadow width (px)
const BORDER_SHADOW_WIDTH = 4;
// Arrow shadow color (rgba r,g,b,a) to fine-tune arrow shadow independently
const ARROW_SHADOW_COLOR = '0,0,0,0.05';
// Arrow height
const ARROW_SIZE = 18; // px

type MyTooltipProps = {
  children: React.ReactNode;
  title: React.ReactNode;
};

const MyTooltip: React.FC<MyTooltipProps> = ({ children, title }) => {
  // Build a soft shadow using the configured color and width
  const shadowPx = `${BORDER_SHADOW_WIDTH}px`;
  // Bottom and right shadows
  const boxShadow = `0 ${shadowPx} ${shadowPx} rgba(${BORDER_SHADOW}), ${shadowPx} 0 ${shadowPx} rgba(${BORDER_SHADOW})`;
  // Arrow shadow (separate control) using the same geometry as the box
  const arrowShadow = `0 ${shadowPx} ${shadowPx} rgba(${ARROW_SHADOW_COLOR}), ${shadowPx} 0 ${shadowPx} rgba(${ARROW_SHADOW_COLOR})`;

  return (
    <Tooltip
      title={<>Teste <i><b onClick={() => alert('123456')}>123456</b></i></>}
      arrow
      placement="top"
      enterDelay={0}
      enterNextDelay={0}
      leaveDelay={0}
      slotProps={{
        // Style the tooltip surface
        tooltip: {
          style: {
            backgroundColor: COLOR,
            color: 'inherit',
            border: `1px solid ${BORDER_COLOR}`,
            boxShadow,
            // Keep default spacing/typography from MUI
          },
          // Use sx only where style cannot target pseudo-elements
          sx: {
            '& .MuiTooltip-arrow': {
              // Make arrow background match bubble color
              color: COLOR,
              // Control arrow size via fontSize in px
              fontSize: `${ARROW_SIZE}px`,
              // Add a border and shadow to the arrow tip
              '&::before': {
                border: `1px solid ${BORDER_COLOR}`,
                boxShadow: arrowShadow,
              },
            },
          },
        },
        // Style the popper container if needed (no transitions)
        popper: {
          style: {
            transition: 'none',
          },
        },
      }}
    >
      <span style={{ cursor: 'default' }}>{children}</span>
    </Tooltip>
  );
};

export default MyTooltip;


