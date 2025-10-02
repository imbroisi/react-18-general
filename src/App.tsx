import { useRef, useState } from 'react';
import './App.css';
import Cell from './components/Cell/Cell';
import ScrollbarDeveopment from './ScrollbarDeveopment';
import ScrollTry3 from './components/ScrollTry3/ScrollTry3';

const COLS = 5;

const App = () => {
  const [show, setShow] = useState<boolean[]>(new Array(19).fill(true));
  const [rotatedArrows, setRotatedArrows] = useState<boolean[]>(new Array(19).fill(true));

  const toggleArrow = (index: number) => {
    const newRotatedArrows = [...rotatedArrows];
    newRotatedArrows[index] = !newRotatedArrows[index];
    setRotatedArrows(newRotatedArrows);

    const newShow = [...show];
    newShow[index] = !newShow[index];
    setShow(newShow);
  };
  const fixedColumnRef = useRef<HTMLDivElement>(null);
  const scrollableColumnRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const scrollingElement = event.currentTarget;
    const isFixedColumn = scrollingElement === fixedColumnRef.current;

    if (isFixedColumn && scrollableColumnRef.current) {
      scrollableColumnRef.current.scrollTop = scrollingElement.scrollTop;
    } else if (!isFixedColumn && fixedColumnRef.current) {
      fixedColumnRef.current.scrollTop = scrollingElement.scrollTop;
    }
  };

  console.log(show);

  // return (
  //   <div className="table-container">
  //     {/* ======================== Left Content ======================== */}

  //     {/* Fixed column section */}
  //     <div className="fixed-column">
  //       {/* Fixed column header */}
  //       <div className="fixed-column-header">
  //         {/* Row # */}
  //         {/* <button onClick={() => setShow(!show)}>Toggle</button> */}
  //       </div>

  //       {/* Fixed column scrollable content */}
  //       <div
  //         ref={fixedColumnRef}
  //         onScroll={handleScroll}
  //         className="fixed-column-content"
  //         style={{
  //           // Do not move to CSS, as this will cause a delay in verical scrolling synchronization
  //           overflow: 'hidden',
  //           overflowY: 'scroll',
  //           scrollbarWidth: 'none',
  //           msOverflowStyle: 'none'
  //         }}>
  //         <div className="fixed-column-table">
  //           {Array.from({ length: 19 }).map((_, rowIndex) => (
  //             <div
  //               key={rowIndex}
  //               className="fixed-column-row"
  //               style={{
  //                 height: show[rowIndex] ? '120px' : '0',
  //                 maxHeight: show[rowIndex] ? '120px' : '0',
  //                 overflow: 'hidden'
  //               }}
  //             >
  //               <div className="fixed-column-cell" style={{
  //                 height: show[rowIndex] ? '40px' : '0'
  //               }}>
  //                 Holding {rowIndex + 1}
  //                 <span
  //                   onClick={() => toggleArrow(rowIndex)}
  //                   className="arrow-icon"
  //                   style={{
  //                     transform: rotatedArrows[rowIndex] ? 'rotate(90deg)' : 'none'
  //                   }}>▶</span>

  //                 <div className="expandable-content" style={{
  //                   height: show[rowIndex] ? '90px' : '0',
  //                   overflow: 'hidden',
  //                   paddingTop: '3px',
  //                   // padding: 0,
  //                 }}>
  //                   Item 1
  //                   <br />
  //                   Other item
  //                   <br />
  //                   Another item
  //                   <br />
  //                   Yet another item
  //                   <br />
  //                 </div>

  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>

  //     {/* ======================== Holdings Links ======================== */}

  //     {/* Scrollable section */}
  //     <div
  //       ref={scrollableColumnRef}
  //       onScroll={handleScroll}
  //       className="scrollable-section"
  //       style={{
  //         // Do not move to CSS, as this will cause a delay in vertical scrolling synchronization.
  //         overflow: 'auto'
  //       }}>
  //       <div className="scrollable-content" style={{ width: `${COLS * 300}px` }}>
  //         {/* Header row */}
  //         <div className="scrollable-header">
  //           {Array.from({ length: COLS }).map((_, colIndex) => (
  //             <div
  //               key={colIndex}
  //               className="header-cell"
  //             >
  //               {colIndex + 2023}
  //             </div>
  //           ))}
  //         </div>

  //         {/* Table content */}
  //         <div className="table-content" style={{ width: `${COLS * 300}px` }}>
  //           {Array.from({ length: 19 }).map((_, rowIndex) => (
  //             <div key={rowIndex} className="table-row" style={{
  //               height: show[rowIndex] ? '120px' : '0',
  //               maxHeight: show[rowIndex] ? '120px' : '0',
  //               overflow: 'hidden'
  //             }}>
  //               {Array.from({ length: COLS }).map((_, colIndex) => (
  //                 <Cell
  //                   key={colIndex}
  //                   showMe={show[rowIndex]}
  //                   label={`R${rowIndex + 2} C${colIndex + 2}`}
  //                 />
  //               ))}
  //             </div>
  //           ))}
  //         </div>
  //       </div>
  //     </div>
  //   </div>

  // );

  return (
    // <ScrollbarDeveopment />
    <ScrollTry3 />
  );
};

export default App;