import { useState, useMemo } from 'react';
import { initialAdminUsers } from '../../mock/admin/users';
import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import { Search, Lock, Unlock, Shield, User } from 'lucide-react';
import '../../components/admin/Admin.css';

export const Users = () => {
  const [users, setUsers] = useState(initialAdminUsers);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtered dataset
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || u.status === statusFilter;

      const matchesRole =
        roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  // Paginated dataset
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;

  // Handlers
  const handleToggleStatus = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'active' ? 'locked' : 'active' }
          : u
      )
    );
  };

  const handleToggleRole = (userId) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, role: u.role === 'admin' ? 'student' : 'admin' }
          : u
      )
    );
  };

  const columns = [
    { header: 'User' },
    { header: 'Email' },
    { header: 'Role' },
    { header: 'Status' },
    { header: 'Joined Date' },
    { header: 'Actions', style: { textAlign: 'right' } }
  ];

  return (
    <div className="admin-page-content">
      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            icon={Search}
            className="admin-search-input"
          />
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'Tất cả trạng thái', value: 'all' },
              { label: 'Hoạt động (Active)', value: 'active' },
              { label: 'Đã khóa (Locked)', value: 'locked' }
            ]}
            className="admin-filter-select"
          />
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'Tất cả vai trò', value: 'all' },
              { label: 'Student', value: 'student' },
              { label: 'Admin', value: 'admin' }
            ]}
            className="admin-filter-select"
          />
        </div>
      </div>

      {/* Users Table */}
      <AdminTable
        columns={columns}
        data={paginatedUsers}
        emptyMessage="Không tìm thấy người dùng phù hợp."
        renderRow={(u) => (
          <tr key={u.id}>
            <td>
              <div className="admin-cell-user">
                <img src={u.avatar} alt={u.name} className="admin-cell-avatar" />
                <div className="admin-cell-title">{u.name}</div>
              </div>
            </td>
            <td>{u.email}</td>
            <td>
              <StatusBadge value={u.role} />
            </td>
            <td>
              <StatusBadge value={u.status} />
            </td>
            <td>{u.joinedDate}</td>
            <td>
              <div className="admin-table-actions" style={{ justifyContent: 'flex-end' }}>
                <Button
                  variant={u.status === 'active' ? 'danger' : 'outline'}
                  size="sm"
                  onClick={() => handleToggleStatus(u.id)}
                  icon={u.status === 'active' ? Lock : Unlock}
                >
                  {u.status === 'active' ? 'Lock' : 'Unlock'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleRole(u.id)}
                  icon={u.role === 'admin' ? User : Shield}
                >
                  {u.role === 'admin' ? 'Make Student' : 'Make Admin'}
                </Button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination-bar">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
};

export default Users;
