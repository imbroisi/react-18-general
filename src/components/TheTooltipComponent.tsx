import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import './TheTooltipComponent.css';

const TheTooltipComponent: React.FC = () => {
  return (
    // <div className="tooltip-container">
      <Tooltip
        title="Live long to popover!"
        placement="top"
        arrow={true}
        enterDelay={0}
        enterNextDelay={0}
        leaveDelay={0}
        // TransitionProps={{
        //   timeout: 0,
        //   style: { transitionDuration: '0ms' },
        // }}
        slotProps={{
          tooltip: {
            className: 'speech-bubble-tooltip-paper',
          },
          popper: {
            style: { transition: 'none' },
          },
        }}
      >
        <span className="tooltip-trigger">
          Here I am
        </span>
      </Tooltip>
    // </div>
  );
};

export default TheTooltipComponent;

