import React, { useState, useCallback, useRef } from 'react';
import './DraggableTable.css';

interface DraggableTableProps {
  rows: number;
  cols: number;
  data?: string[][];
  columnHeaders?: string[];
  rowHeaders?: string[];
  fixedColumns?: number; // Number of fixed columns from the left
}

interface DragState {
  isDragging: boolean;
  type: 'row' | 'column' | null;
  index: number | null;
  startX: number;
  startY: number;
}

const DraggableTable: React.FC<DraggableTableProps> = ({ 
  rows, 
  cols, 
  data: initialData, 
  columnHeaders, 
  rowHeaders,
  fixedColumns = 0
}) => {
  // Track the order of columns
  const [columnOrder, setColumnOrder] = useState<number[]>(() => 
    Array.from({ length: cols }, (_, i) => i)
  );

  const [data, setData] = useState<string[][]>(() => {
    if (initialData) return initialData;
    
    // Generate default data if none provided
    const defaultData: string[][] = [];
    for (let i = 0; i < rows; i++) {
      const row: string[] = [];
      for (let j = 0; j < cols; j++) {
        row.push(`Cell ${i + 1}-${j + 1}`);
      }
      defaultData.push(row);
    }
    return defaultData;
  });

  // Track row order
  const [rowOrder, setRowOrder] = useState<number[]>(() => 
    Array.from({ length: rows }, (_, i) => i)
  );

  // Track row headers order
  const [rowHeadersOrder, setRowHeadersOrder] = useState<string[]>(() => 
    rowHeaders || Array.from({ length: rows }, (_, i) => `Row ${i + 1}`)
  );

  // Track checked rows by unique identifier
  const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set());

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    type: null,
    index: null,
    startX: 0,
    startY: 0,
  });

  const tableRef = useRef<HTMLTableElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'row' | 'column', index: number) => {
    e.preventDefault();
    setDragState({
      isDragging: true,
      type,
      index,
      startX: e.clientX,
      startY: e.clientY,
    });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !tableRef.current) return;

    const table = tableRef.current;
    const rect = table.getBoundingClientRect();

    if (dragState.type === 'column') {
      // Find the target display index based on mouse position
      const headerCells = table.querySelectorAll('thead th');
      let targetDisplayIndex = -1;
      
      for (let i = 0; i < headerCells.length; i++) {
        const cell = headerCells[i] as HTMLElement;
        const cellRect = cell.getBoundingClientRect();
        if (e.clientX >= cellRect.left && e.clientX <= cellRect.right) {
          targetDisplayIndex = i - 2; // Subtract 2 for corner cell and checkbox column
          break;
        }
      }
      
      if (targetDisplayIndex >= 0 && targetDisplayIndex < cols && targetDisplayIndex !== dragState.index) {
        // Prevent moving columns into fixed columns area
        if (targetDisplayIndex >= fixedColumns) {
          const newColumnOrder = [...columnOrder];
          const draggedItem = newColumnOrder[dragState.index!];
          newColumnOrder.splice(dragState.index!, 1);
          newColumnOrder.splice(targetDisplayIndex, 0, draggedItem);
          setColumnOrder(newColumnOrder);
          setDragState(prev => ({ ...prev, index: targetDisplayIndex }));
        }
      }
    } else if (dragState.type === 'row') {
      // Find the target row index based on mouse position
      const rowCells = table.querySelectorAll('tbody tr');
      let targetRowIndex = -1;
      
      for (let i = 0; i < rowCells.length; i++) {
        const row = rowCells[i] as HTMLElement;
        const rowRect = row.getBoundingClientRect();
        if (e.clientY >= rowRect.top && e.clientY <= rowRect.bottom) {
          targetRowIndex = i;
          break;
        }
      }
      
      if (targetRowIndex >= 0 && targetRowIndex < rows && targetRowIndex !== dragState.index) {
        const newRowOrder = [...rowOrder];
        const newRowHeadersOrder = [...rowHeadersOrder];
        const draggedRowIndex = newRowOrder[dragState.index!];
        const draggedHeader = newRowHeadersOrder[dragState.index!];
        
        newRowOrder.splice(dragState.index!, 1);
        newRowOrder.splice(targetRowIndex, 0, draggedRowIndex);
        newRowHeadersOrder.splice(dragState.index!, 1);
        newRowHeadersOrder.splice(targetRowIndex, 0, draggedHeader);
        
        setRowOrder(newRowOrder);
        setRowHeadersOrder(newRowHeadersOrder);
        setDragState(prev => ({ ...prev, index: targetRowIndex }));
      }
    }
  }, [dragState, columnOrder, rowHeadersOrder, cols, rows]);

  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      type: null,
      index: null,
      startX: 0,
      startY: 0,
    });
  }, []);

  const handleCheckboxChange = useCallback((row: string[]) => {
    const rowId = row.join('|');
    setCheckedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="draggable-table-container">
      <table 
        ref={tableRef} 
        className={`draggable-table ${
          dragState.isDragging 
            ? dragState.type === 'column' 
              ? 'dragging-column' 
              : 'dragging-row'
            : ''
        }`}
      >
        <thead>
          <tr>
            <th className="corner-cell"></th>
            <th className="checkbox-header"></th>
            {columnOrder.map((originalColIndex, displayIndex) => (
              <th
                key={originalColIndex}
                className={`${displayIndex < fixedColumns ? 'fixed-header' : 'draggable-header'} ${dragState.isDragging && dragState.type === 'column' && dragState.index === displayIndex ? 'dragging' : ''}`}
                onMouseDown={displayIndex < fixedColumns ? undefined : (e) => handleMouseDown(e, 'column', displayIndex)}
              >
                {columnHeaders ? columnHeaders[originalColIndex] : `Col ${originalColIndex + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowOrder.map((originalRowIndex, displayIndex) => {
            const row = data[originalRowIndex];
            const rowId = row.join('|'); // Create unique ID from row content
            return (
              <tr
                key={displayIndex}
                className={`draggable-row ${dragState.isDragging && dragState.type === 'row' && dragState.index === displayIndex ? 'dragging' : ''} ${checkedRows.has(rowId) ? 'checked-row' : ''}`}
              >
                <td
                  className={`checkbox-cell ${dragState.isDragging && dragState.type === 'row' && dragState.index === displayIndex ? 'dragging' : ''} ${checkedRows.has(rowId) ? 'checked-row' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={checkedRows.has(rowId)}
                    onChange={() => handleCheckboxChange(row)}
                    className="row-checkbox"
                  />
                </td>
                <td
                  className={`row-header ${dragState.isDragging && dragState.type === 'row' && dragState.index === displayIndex ? 'dragging' : ''} ${checkedRows.has(rowId) ? 'checked-row' : ''}`}
                  onMouseDown={(e) => handleMouseDown(e, 'row', displayIndex)}
                >
                  {rowHeadersOrder[displayIndex]}
                </td>
                {columnOrder.map((originalColIndex, colDisplayIndex) => (
                  <td 
                    key={originalColIndex} 
                    className={`table-cell ${
                      dragState.isDragging && dragState.type === 'column' && dragState.index === colDisplayIndex 
                        ? 'dragging-column-cell' 
                        : dragState.isDragging && dragState.type === 'row' && dragState.index === displayIndex
                        ? 'dragging-row-cell'
                        : ''
                    } ${checkedRows.has(rowId) ? 'checked-row' : ''}`}
                  >
                    {row[originalColIndex]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DraggableTable; 