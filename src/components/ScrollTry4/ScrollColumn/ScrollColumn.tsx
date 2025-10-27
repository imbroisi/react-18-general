import { useEffect, useRef } from 'react';
import { useScrollControl } from './ScrollControlContext';

const Column3 = () => {
  const { registerScrollable } = useScrollControl();
  const scrollableRef = useRef<HTMLDivElement>(null);
  const scrollableContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unregister = registerScrollable(scrollableRef.current!, scrollableContentRef.current!);
    return unregister;
  }, [registerScrollable]);

  return (
    <div ref={scrollableRef} style={{
      overflowY: 'auto',
      background: '#fafafa',
      width: '18px',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute',
        right: 0,
        width: '100%',
      }}>
        <div ref={scrollableContentRef} />
      </div>
    </div>
  );
};

export default Column3;
