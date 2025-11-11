import React from 'react';
import Tooltip from '@mui/material/Tooltip';
import styles from './MyTooltip.module.scss';

type MyTooltipProps = {
  children: React.ReactNode;
  title: React.ReactNode;
};

const TOOLTIP_Y_DISTANCE = -4;

const MyTooltip: React.FC<MyTooltipProps> = ({ children, title }) => {
  // Controls the vertical distance between tooltip and the trigger (in px)
  return (
    <Tooltip
      title={<>Teste <i><b onClick={() => alert('123456')}>123456</b></i></>}
      arrow
      placement="top"
      enterDelay={0}
      enterNextDelay={0}
      leaveDelay={0}
      TransitionProps={{
        timeout: { enter: 200, exit: 0 },
      }}
      slotProps={{
        // Style the tooltip surface
        tooltip: {
          className: styles.tooltipSurface,
        },
        arrow: {
          className: styles.arrow,
        },
        // Style the popper container if needed (no transitions)
        popper: {
          style: {
            transition: 'none',
          },
          modifiers: [
            { name: 'offset', options: { offset: [0, TOOLTIP_Y_DISTANCE] } },
          ],
        },
      }}
    >
      <span className={styles.trigger}>{children}</span>
    </Tooltip>
  );
};

export default MyTooltip;


