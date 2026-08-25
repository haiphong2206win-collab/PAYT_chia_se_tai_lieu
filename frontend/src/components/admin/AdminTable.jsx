import Spinner from '../common/Spinner';
import { Inbox } from 'lucide-react';
import './Admin.css';

export const AdminTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'Không tìm thấy dữ liệu',
  renderRow
}) => {
  return (
    <div className="admin-table-container">
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={col.className || ''} style={col.style}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="admin-table-loading">
                  <Spinner size="md" color="var(--primary-orange)" />
                  <span>Đang tải dữ liệu...</span>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="admin-table-empty">
                  <Inbox size={40} className="empty-icon" />
                  <p>{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTable;
