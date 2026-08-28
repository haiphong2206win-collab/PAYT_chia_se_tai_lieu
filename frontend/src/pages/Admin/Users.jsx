import {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';

import AdminTable from '../../components/admin/AdminTable';
import StatusBadge from '../../components/admin/StatusBadge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';

import {
  Search,
  Lock,
  Unlock,
  Shield,
  User,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

import {
  getAdminUsersApi,
  updateAdminUserStatusApi,
  updateAdminUserRoleApi,
} from '../../services/admin.api';

import '../../components/admin/Admin.css';

// FORMAT DATE

const formatJoinedDate = (dateValue) => {
  if (!dateValue) {
    return '—';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('vi-VN');
};

// MAP BACKEND USER → ADMIN UI

const mapAdminUser = (user) => ({
  id:
    user.id ||
    user.user_id ||
    '',

  name:
    user.full_name ||
    user.fullName ||
    user.name ||
    'Unknown User',

  email:
    user.email ||
    '',

  avatar:
    user.avatar ||
    user.avatar_url ||
    '',

  role: String(
    user.role ||
    'student'
  )
    .trim()
    .toLowerCase(),

  status: String(
    user.status ||
    'active'
  )
    .trim()
    .toLowerCase(),

  joinedDate:
    formatJoinedDate(
      user.created_at ||
      user.createdAt
    ),
});

// ADMIN USERS

export const Users = () => {
  // DATA

  const [
    users,
    setUsers,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  // FILTERS

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('all');

  const [
    roleFilter,
    setRoleFilter,
  ] = useState('all');

  // PAGINATION

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const itemsPerPage = 5;

  // ACTION STATE

  const [
    updatingUserId,
    setUpdatingUserId,
  ] = useState(null);

  const [
    actionError,
    setActionError,
  ] = useState('');

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  // GET /admin/users

  const loadAdminUsers =
    useCallback(async () => {
      setIsLoading(true);
      setLoadError('');

      try {
        const response =
          await getAdminUsersApi();

        // Hỗ trợ các response wrapper thông thường
        // nhưng không tạo dữ liệu mock.
        const backendUsers =
          response?.users ||
          response?.data?.users ||
          (
            Array.isArray(response?.data)
              ? response.data
              : Array.isArray(response)
                ? response
                : []
          );

        setUsers(
          Array.isArray(
            backendUsers
          )
            ? backendUsers.map(
              mapAdminUser
            )
            : []
        );
      } catch (error) {
        console.error(
          'Admin Users API error:',
          error
        );

        setUsers([]);

        setLoadError(
          error.response
            ?.data
            ?.message ||
          'Unable to load users.'
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    loadAdminUsers();
  }, [loadAdminUsers]);

  // FILTERED USERS

  const filteredUsers =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return users.filter(
        (user) => {
          const name =
            String(
              user.name ||
              ''
            ).toLowerCase();

          const email =
            String(
              user.email ||
              ''
            ).toLowerCase();

          const matchesSearch =
            !keyword ||
            name.includes(
              keyword
            ) ||
            email.includes(
              keyword
            );

          const matchesStatus =
            statusFilter ===
            'all' ||
            user.status ===
            statusFilter;

          const matchesRole =
            roleFilter ===
            'all' ||
            user.role ===
            roleFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesRole
          );
        }
      );
    }, [
      users,
      search,
      statusFilter,
      roleFilter,
    ]);

  // PAGINATION

  const paginatedUsers =
    useMemo(() => {
      const startIndex =
        (
          currentPage - 1
        ) * itemsPerPage;

      return filteredUsers.slice(
        startIndex,
        startIndex +
        itemsPerPage
      );
    }, [
      filteredUsers,
      currentPage,
    ]);

  const totalPages =
    Math.ceil(
      filteredUsers.length /
      itemsPerPage
    ) || 1;

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // SUCCESS MESSAGE

  const showSuccessMessage =
    (message) => {
      setSuccessMessage(
        message
      );

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    };

  // PATCH USER STATUS
  //
  // PATCH /admin/users/:userId/status
  //
  // {
  //   status: "active" | "locked"
  // }

  const handleToggleStatus =
    async (user) => {
      if (
        !user?.id ||
        updatingUserId
      ) {
        return;
      }

      const nextStatus =
        user.status ===
          'active'
          ? 'locked'
          : 'active';

      setUpdatingUserId(
        user.id
      );

      setActionError('');

      try {
        const response =
          await updateAdminUserStatusApi(
            user.id,
            nextStatus
          );

        await loadAdminUsers();

        showSuccessMessage(
          response?.message ||
          (
            nextStatus ===
              'locked'
              ? 'User locked successfully!'
              : 'User unlocked successfully!'
          )
        );
      } catch (error) {
        console.error(
          'Admin User Status API error:',
          error
        );

        setActionError(
          error.response
            ?.data
            ?.message ||
          'Unable to update user status.'
        );
      } finally {
        setUpdatingUserId(
          null
        );
      }
    };

  // PATCH USER ROLE
  //
  // PATCH /admin/users/:userId/role
  //
  // {
  //   role: "admin" | "student"
  // }

  const handleToggleRole =
    async (user) => {
      if (
        !user?.id ||
        updatingUserId
      ) {
        return;
      }

      const nextRole =
        user.role ===
          'admin'
          ? 'student'
          : 'admin';

      setUpdatingUserId(
        user.id
      );

      setActionError('');

      try {
        const response =
          await updateAdminUserRoleApi(
            user.id,
            nextRole
          );

        await loadAdminUsers();

        showSuccessMessage(
          response?.message ||
          (
            nextRole ===
              'admin'
              ? 'User promoted to admin successfully!'
              : 'User changed to student successfully!'
          )
        );
      } catch (error) {
        console.error(
          'Admin User Role API error:',
          error
        );

        setActionError(
          error.response
            ?.data
            ?.message ||
          'Unable to update user role.'
        );
      } finally {
        setUpdatingUserId(
          null
        );
      }
    };

  // TABLE COLUMNS

  const columns = [
    {
      header: 'User',
    },
    {
      header: 'Email',
    },
    {
      header: 'Role',
    },
    {
      header: 'Status',
    },
    {
      header: 'Joined Date',
    },
    {
      header: 'Actions',
      style: {
        textAlign: 'right',
      },
    },
  ];

  // UI

  return (
    <div className="admin-page-content">

      {/* FILTER BAR */}

      <div className="admin-filter-bar">
        <div className="admin-filter-group">

          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => {
              setSearch(
                e.target.value
              );

              setCurrentPage(1);
            }}
            icon={Search}
            className="admin-search-input"
          />

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value
              );

              setCurrentPage(1);
            }}
            options={[
              {
                label:
                  'Tất cả trạng thái',
                value: 'all',
              },
              {
                label:
                  'Hoạt động (Active)',
                value: 'active',
              },
              {
                label:
                  'Đã khóa (Locked)',
                value: 'locked',
              },
            ]}
            className="admin-filter-select"
          />

          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(
                e.target.value
              );

              setCurrentPage(1);
            }}
            options={[
              {
                label:
                  'Tất cả vai trò',
                value: 'all',
              },
              {
                label:
                  'Student',
                value: 'student',
              },
              {
                label:
                  'Admin',
                value: 'admin',
              },
            ]}
            className="admin-filter-select"
          />

        </div>
      </div>

      {/* SUCCESS */}

      {successMessage && (
        <div
          className="payt-card"
          style={{
            marginBottom:
              '16px',
          }}
        >
          <CheckCircle
            size={18}
          />{' '}

          {successMessage}
        </div>
      )}

      {/* ACTION ERROR */}

      {actionError && (
        <div
          className="payt-card"
          style={{
            marginBottom:
              '16px',
          }}
        >
          <AlertTriangle
            size={18}
          />{' '}

          {actionError}
        </div>
      )}

      {/* LOAD ERROR */}

      {loadError && (
        <div
          className="payt-card"
          style={{
            marginBottom:
              '16px',
          }}
        >
          <AlertTriangle
            size={18}
          />{' '}

          {loadError}
        </div>
      )}

      {/* USERS TABLE */}

      {isLoading ? (
        <div className="payt-card">
          Loading users...
        </div>
      ) : (
        <>
          <AdminTable
            columns={columns}
            data={paginatedUsers}
            emptyMessage="Không tìm thấy người dùng phù hợp."
            renderRow={(user) => (
              <tr key={user.id}>

                {/* USER */}

                <td>
                  <div className="admin-cell-user">

                    {user.avatar ? (
                      <img
                        src={
                          user.avatar
                        }
                        alt={
                          user.name
                        }
                        className="admin-cell-avatar"
                      />
                    ) : (
                      <div
                        className="admin-cell-avatar"
                        style={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          justifyContent:
                            'center',
                        }}
                      >
                        <User
                          size={18}
                        />
                      </div>
                    )}

                    <div className="admin-cell-title">
                      {
                        user.name
                      }
                    </div>

                  </div>
                </td>

                {/* EMAIL */}

                <td>
                  {
                    user.email ||
                    '—'
                  }
                </td>

                {/* ROLE */}

                <td>
                  <StatusBadge
                    value={
                      user.role
                    }
                  />
                </td>

                {/* STATUS */}

                <td>
                  <StatusBadge
                    value={
                      user.status
                    }
                  />
                </td>

                {/* JOINED DATE */}

                <td>
                  {
                    user.joinedDate
                  }
                </td>

                {/* ACTIONS */}

                <td>
                  <div
                    className="admin-table-actions"
                    style={{
                      justifyContent:
                        'flex-end',
                    }}
                  >

                    {/* LOCK / UNLOCK */}

                    <Button
                      variant={
                        user.status ===
                          'active'
                          ? 'danger'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() =>
                        handleToggleStatus(
                          user
                        )
                      }
                      icon={
                        user.status ===
                          'active'
                          ? Lock
                          : Unlock
                      }
                      disabled={
                        updatingUserId ===
                        user.id
                      }
                    >
                      {
                        updatingUserId ===
                          user.id
                          ? 'Updating...'
                          : user.status ===
                            'active'
                            ? 'Lock'
                            : 'Unlock'
                      }
                    </Button>

                    {/* ROLE */}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        handleToggleRole(
                          user
                        )
                      }
                      icon={
                        user.role ===
                          'admin'
                          ? User
                          : Shield
                      }
                      disabled={
                        updatingUserId ===
                        user.id
                      }
                    >
                      {
                        updatingUserId ===
                          user.id
                          ? 'Updating...'
                          : user.role ===
                            'admin'
                            ? 'Make Student'
                            : 'Make Admin'
                      }
                    </Button>

                  </div>
                </td>

              </tr>
            )}
          />

          {/* PAGINATION */}

          {totalPages > 1 && (
            <div className="admin-pagination-bar">

              <Pagination
                currentPage={
                  currentPage
                }
                totalPages={
                  totalPages
                }
                onPageChange={(
                  page
                ) =>
                  setCurrentPage(
                    page
                  )
                }
              />

            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Users;