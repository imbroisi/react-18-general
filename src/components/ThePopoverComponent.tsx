import React, { useState } from 'react';
import Popover from '@mui/material/Popover';
import './ThePopoverComponent.css';

const ThePopoverComponent: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleTriggerMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleTriggerMouseLeave = () => {
    setAnchorEl(null);
  };

  const handlePopoverMouseLeave = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <div className="popover-container">
      <span
        className="popover-trigger"
        onMouseEnter={handleTriggerMouseEnter}
        onMouseLeave={handleTriggerMouseLeave}
      >
        Here I am
      </span>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleTriggerMouseLeave}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        disableRestoreFocus
        className="speech-bubble-popover"
        slotProps={{
          paper: {
            className: 'speech-bubble-paper',
            style: {
              overflow: 'visible',
            },
          },
        }}
      >
        <div 
          className="speech-bubble-wrapper"
          onMouseLeave={handlePopoverMouseLeave}
        >
          <div className="speech-bubble-content">
            Live long to popover!
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default ThePopoverComponent;

