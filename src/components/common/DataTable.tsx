
import { Table } from 'antd';
import type { TableProps } from 'antd';

interface DataTableProps<T> extends TableProps<T> {
  loading?: boolean;
}

export function DataTable<T extends object>({
  loading = false,
  ...props
}: DataTableProps<T>) {
  return (
    <Table
      loading={loading}
      bordered
      pagination={{ pageSize: 10, showSizeChanger: true }}
      {...props}
    />
  );
}

export default DataTable;