import { SCROLLBAR_CONFIG } from "./config";

interface ArrowProps {
  top?: boolean,
  left?: boolean,
  right?: boolean,
  bottom?: boolean,
  onClick: (_event: React.MouseEvent<HTMLDivElement>) => void,
};

const Arrow = (props: ArrowProps) => {
  // bottom is default
  const { top, left, right, onClick } = props;

  const id = top ? 'top' : left ? 'left' : right ? 'right' : 'bottom'

  const viewBox = {
    top: '0 0 12 9',
    left: '0 0 9 12',
    right: '0 0 9 12',
    bottom: '0 0 12 9',
  }[id];

  const d = {
    top: "M6 2.5C6.4 2.5 6.7 2.7 6.9 3L9.8 7C10.1 7.6 9.7 8.5 9 8.5H3C2.3 8.5 1.9 7.6 2.2 7L5.1 3C5.3 2.7 5.6 2.5 6 2.5Z",
    left: "M2.5 6C2.5 5.6 2.7 5.3 3 5.1L6.5 2.2C7.1 1.9 8 2.3 8 3V9C8 9.7 7.1 10.1 6.5 9.8L3 6.9C2.7 6.7 2.5 6.4 2.5 6Z",
    right: "M6.5 6C6.5 6.4 6.3 6.7 6 6.9L2.5 9.8C1.9 10.1 1 9.7 1 9V3C1 2.3 1.9 1.9 2.5 2.2L6 5.1C6.3 5.3 6.5 5.6 6.5 6Z",
    bottom: "M6 7C5.6 7 5.3 6.8 5.1 6.5L2.2 2.5C1.9 1.9 2.3 1 3 1H9C9.7 1 10.1 1.9 9.8 2.5L6.9 6.5C6.7 6.8 6.4 7 6 7Z"
  }[id]

  const unicStyle: any = {
    top: { right: '0', top: '0' },
    left: { left: '0', top: '0' },
    right: { right: '0', top: '0' },
    bottom: { bottom: '0' }
  }[id];

  const Icon = () => (
    <svg
      width="11"
      height="13"
      viewBox={viewBox}
      fill="none"
    >
      <path
        d={d}
        fill={SCROLLBAR_CONFIG.arrowColor}
      />
    </svg>
  );

  const className = `use-scroll-manager-arrow use-scroll-manager-arrow-${right ? 'right' : top ? 'top' : left ? 'left' : 'bottom'}`;
  return (
    <div
      className={className}
      style={{
        ...unicStyle,
        position: 'absolute',
        width: SCROLLBAR_CONFIG.width,
        height: SCROLLBAR_CONFIG.width,
        backgroundColor: SCROLLBAR_CONFIG.arrowBackgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(e);
      }}
    >
      <Icon />
    </div>

  );
};

export default Arrow;