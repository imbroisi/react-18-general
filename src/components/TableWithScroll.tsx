import React from 'react';

type TableItem = {
  col1: string;
  col2: string;
  col3: string;
  col4: string;
};

type TableWithScrollProps = {
  tableData?: TableItem[];
};

// Array default com 20 itens
const DEFAULT_TABLE_DATA: TableItem[] = Array.from({ length: 1 }).map((_, index) => ({
  col1: `Item ${index + 1} - Coluna 1`,
  col2: `Item ${index + 1} - Coluna 2`,
  col3: `Item ${index + 1} - Coluna 3`,
  col4: `Item ${index + 1} - Coluna 4`,
}));

const SCROLL_CLASS = 'table-scroll-no-scrollbar';

const TableWithScroll: React.FC<TableWithScrollProps> = ({ tableData }) => {
  const data = tableData && tableData.length > 0 ? tableData : DEFAULT_TABLE_DATA;
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLTableSectionElement>(null);
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const [scrollState, setScrollState] = React.useState({
    verticalVisible: false,
    thumbHeightPercent: 0,
    thumbTopPercent: 0,
    horizontalVisible: false,
    thumbWidthPercent: 0,
    thumbLeftPercent: 0,
  });

  React.useLayoutEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) {
      return undefined;
    }

    const updateHeaderHeight = () => {
      setHeaderHeight(headerEl.getBoundingClientRect().height);
    };

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    updateHeaderHeight();
    resizeObserver.observe(headerEl);

    return () => resizeObserver.disconnect();
  }, []);

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    const canScrollVertically = el.scrollHeight > el.clientHeight;
    const verticalRatio = Math.min(1, el.clientHeight / el.scrollHeight);
    const thumbHeightPercent = Math.max(10, verticalRatio * 100);
    const verticalRange = el.scrollHeight - el.clientHeight;
    const thumbTopPercent =
      verticalRange <= 0 ? 0 : (el.scrollTop / verticalRange) * (100 - thumbHeightPercent);

    const canScrollHorizontally = el.scrollWidth > el.clientWidth;
    const horizontalRatio = Math.min(1, el.clientWidth / el.scrollWidth);
    const thumbWidthPercent = Math.max(10, horizontalRatio * 100);
    const horizontalRange = el.scrollWidth - el.clientWidth;
    const thumbLeftPercent =
      horizontalRange <= 0 ? 0 : (el.scrollLeft / horizontalRange) * (100 - thumbWidthPercent);

    setScrollState({
      verticalVisible: canScrollVertically,
      thumbHeightPercent,
      thumbTopPercent,
      horizontalVisible: canScrollHorizontally,
      thumbWidthPercent,
      thumbLeftPercent,
    });
  }, []);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return undefined;
    }

    updateScrollState();
    el.addEventListener('scroll', updateScrollState);
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState]);

  return (
    <>
      <style>
        {`.${SCROLL_CLASS}::-webkit-scrollbar { width: 0; height: 0; }`}
      </style>
      <div
        style={{
          maxHeight: '10.5rem',
          overflow: 'hidden',
          border: '1px solid #ccc',
          borderRadius: 4,
          position: 'relative',
          backgroundColor: '#fff',
        }}
      >
        <div
          ref={scrollRef}
          className={SCROLL_CLASS}
          style={{
            maxHeight: '10.5rem',
            overflow: 'auto',
            paddingRight: scrollState.horizontalVisible ? 8 : 0,
            paddingBottom: scrollState.verticalVisible ? 12 : 0,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead ref={headerRef}>
              <tr>
                <th
                  style={{
                    borderBottom: '1px solid #ccc',
                    padding: '4px',
                    textAlign: 'left',
                    position: 'sticky',
                    top: 0,
                    background: '#f9f9f9',
                    zIndex: 1,
                  }}
                >
                  Coluna 1
                </th>
                <th
                  style={{
                    borderBottom: '1px solid #ccc',
                    padding: '4px',
                    textAlign: 'left',
                    position: 'sticky',
                    top: 0,
                    background: '#f9f9f9',
                    zIndex: 1,
                  }}
                >
                  Coluna 2
                </th>
                <th
                  style={{
                    borderBottom: '1px solid #ccc',
                    padding: '4px',
                    textAlign: 'left',
                    position: 'sticky',
                    top: 0,
                    background: '#f9f9f9',
                    zIndex: 1,
                  }}
                >
                  Coluna 3
                </th>
                <th
                  style={{
                    borderBottom: '1px solid #ccc',
                    padding: '4px',
                    textAlign: 'left',
                    position: 'sticky',
                    top: 0,
                    background: '#f9f9f9',
                    zIndex: 1,
                  }}
                >
                  Coluna 4
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ borderBottom: '1px solid #eee', padding: '4px' }}>{item.col1}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '4px' }}>{item.col2}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '4px' }}>{item.col3}</td>
                  <td style={{ borderBottom: '1px solid #eee', padding: '4px' }}>{item.col4}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {scrollState.verticalVisible && (
          <div
            style={{
              position: 'absolute',
              top: headerHeight + 6,
              bottom: scrollState.horizontalVisible ? 24 : 6,
              right: 6,
              width: 10,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: `${scrollState.thumbTopPercent}%`,
                height: `${scrollState.thumbHeightPercent}%`,
                left: 0,
                right: 0,
                borderRadius: 999,
                background: 'linear-gradient(180deg, #999, #444)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        )}
        {scrollState.horizontalVisible && (
          <div
            style={{
              position: 'absolute',
              left: 8,
              right: scrollState.verticalVisible ? 24 : 8,
              bottom: 6,
              height: 10,
              borderRadius: 999,
              backgroundColor: 'rgba(0,0,0,0.08)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: `${scrollState.thumbLeftPercent}%`,
                width: `${scrollState.thumbWidthPercent}%`,
                top: 0,
                bottom: 0,
                borderRadius: 999,
                background: 'linear-gradient(90deg, #999, #444)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export type { TableItem, TableWithScrollProps };
export { DEFAULT_TABLE_DATA };
export default TableWithScroll;


