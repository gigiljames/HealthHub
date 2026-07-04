import getIcon from "../../helpers/getIcon";

export interface ColumnDef<T> {
  header: string;
  headerClassName?: string;
  render: (row: T) => React.ReactNode;
  cellClassName?: string;
}

interface AdminTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  resultLabel?: string;
  pagination?: {
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
  };
}

function AdminTable<T>({
  columns,
  data,
  loading = false,
  keyExtractor,
  onRowClick,
  emptyMessage = "No records found.",
  resultLabel,
  pagination,
}: AdminTableProps<T>) {
  const colSpan = columns.length;

  return (
    <div className="bg-white dark:bg-[#252831] rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
      {resultLabel && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
            Results{" "}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({resultLabel})
            </span>
          </h2>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-[#1f2128] text-gray-600 dark:text-gray-400 text-sm font-medium border-b border-gray-100 dark:border-gray-800">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={`px-6 py-4 ${col.headerClassName ?? ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="text-center py-10">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lightGreen" />
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`hover:bg-gray-50 dark:hover:bg-[#1d1f26] transition-colors${
                    onRowClick ? " cursor-pointer" : ""
                  }`}
                >
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={`px-6 py-4 ${col.cellClassName ?? ""}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-gray-300 dark:text-gray-600 mb-2">
                      {getIcon("search-solid", "40px")}
                    </span>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={pagination.onPrev}
            disabled={pagination.page === 1}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:hover:bg-transparent transition-colors text-sm font-medium"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={pagination.onNext}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-md disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:hover:bg-transparent transition-colors text-sm font-medium"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminTable;
