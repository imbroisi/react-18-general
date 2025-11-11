import React, { useRef, useState } from 'react';
import Popover from '@mui/material/Popover';

// Personalization constants (defaults) — keep in sync with MyTooltip
const COLOR = '#FFFFFF';
const BORDER_COLOR = '#E0E0E0';
// rgba(r,g,b,a) suggestion for a subtle shadow color
const BORDER_SHADOW = '0,0,0,0.12';
// Suggested shadow width (px)
const BORDER_SHADOW_WIDTH = 4;
// Arrow height
const ARROW_SIZE = 8; // px
// Max content width (px)
const MAX_WIDTH = 280;
// Vertical offset between anchor (texto) and popover (px)
const MARGIN = 16;

type MyPopoverProps = {
  children: React.ReactNode;
  title: React.ReactNode;
};

const MyPopover: React.FC<MyPopoverProps> = ({ children, title }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isOverPopoverRef = useRef<boolean>(false);
  const closeTimerRef = useRef<number | null>(null);

  const handleTriggerEnter = (e: React.MouseEvent<HTMLElement>) => {
    triggerRef.current = e.currentTarget as HTMLElement;
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setAnchorEl(triggerRef.current);
  };
  // Never close once opened — no scheduleClose needed
  const handleTriggerLeave = () => {
    // Never close on leaving the trigger
    return;
  };
  const handlePaperEnter = () => {
    isOverPopoverRef.current = true;
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };
  const handlePaperLeave = () => {
    isOverPopoverRef.current = false;
    // Never close on leaving the popover
    return;
  };

  const open = Boolean(anchorEl);

  const shadowPx = `${BORDER_SHADOW_WIDTH}px`;
  const boxShadow = `0 ${shadowPx} ${shadowPx} rgba(${BORDER_SHADOW}), ${shadowPx} 0 ${shadowPx} rgba(${BORDER_SHADOW})`;

  return (
    <span style={{ cursor: 'default', display: 'inline-block' }}>
      <span onMouseEnter={handleTriggerEnter} onMouseLeave={handleTriggerLeave}>
        {children}
      </span>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => {}}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        slotProps={{
          root: {
            onMouseEnter: handlePaperEnter,
            onMouseLeave: handlePaperLeave,
          },
          paper: {
            style: {
              backgroundColor: COLOR,
              color: 'inherit',
              border: `1px solid ${BORDER_COLOR}`,
              boxShadow,
              display: 'inline-block',
              width: 'auto',
              maxWidth: `${MAX_WIDTH}px`,
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflow: 'visible',
              // Move the whole popover up by MARGIN
              transform: `translateY(-${MARGIN}px)`,
              pointerEvents: 'auto',
            },
            sx: {
              // Create downward arrow (border + fill) at bottom center using pseudo elements
              position: 'relative',
              // Keep open while hovering the popover
              '&:hover': {
                // no-op; presence ensures hover behavior is recognized
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: `-${ARROW_SIZE}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: `${ARROW_SIZE}px solid transparent`,
                borderRight: `${ARROW_SIZE}px solid transparent`,
                borderTop: `${ARROW_SIZE}px solid ${COLOR}`,
                filter: `drop-shadow(0 ${shadowPx} ${shadowPx} rgba(${BORDER_SHADOW})) drop-shadow(${shadowPx} 0 ${shadowPx} rgba(${BORDER_SHADOW}))`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                bottom: `-${ARROW_SIZE - 1}px`,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: `${ARROW_SIZE - 1}px solid transparent`,
                borderRight: `${ARROW_SIZE - 1}px solid transparent`,
                borderTop: `${ARROW_SIZE - 1}px solid ${COLOR}`,
              },
            },
            onMouseEnter: handlePaperEnter,
            onMouseLeave: handlePaperLeave,
          },
        }}
      >
        <span
          onMouseEnter={handlePaperEnter}
          onMouseLeave={handlePaperLeave}
          style={{ display: 'inline-block', padding: '8px 12px' }}
        >
          {title}
        </span>
        {/* Invisible hover bridge to avoid flicker across the MARGIN gap */}
        <span
          onMouseEnter={handlePaperEnter}
          onMouseLeave={handlePaperLeave}
          style={{
            position: 'absolute',
            bottom: `-${MARGIN + ARROW_SIZE}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${Math.max(ARROW_SIZE * 12, 240)}px`,
            height: `${MARGIN + ARROW_SIZE}px`,
            pointerEvents: 'auto',
            background: 'transparent',
          }}
        />
      </Popover>
    </span>
  );
};

export default MyPopover;


