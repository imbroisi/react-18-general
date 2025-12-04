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
const DEFAULT_TABLE_DATA: TableItem[] = Array.from({ length: 8 }).map((_, index) => ({
  col1: `Item ${index + 1} - Coluna 1`,
  col2: `Item ${index + 1} - Coluna 2`,
  col3: `Item ${index + 1} - Coluna 3`,
  col4: `Item ${index + 1} - Coluna 4`,
}));

const TableWithScroll: React.FC<TableWithScrollProps> = ({ tableData }) => {
  const data = tableData && tableData.length > 0 ? tableData : DEFAULT_TABLE_DATA;

  return (
    <div
      style={{
        maxHeight: '10.5rem',
        overflow: 'auto',
        border: '1px solid #ccc',
        borderRadius: 4,
        backgroundColor: '#fff',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
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
  );
};

export type { TableItem, TableWithScrollProps };
export { DEFAULT_TABLE_DATA };
export default TableWithScroll;
