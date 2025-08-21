import { useEffect, useState, useRef } from 'react';
import { listUsers, createUser, updateUser, deleteUser } from '../../services/usersService';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Stack, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UserDialog from '../../components/UserDialog';
import DeleteConfirmationDialog from '../../components/DeleteConfirmationDialog';
import { useAlert } from '../../providers/AlertProvider';
import { useGroupedChannelsWithResizableColumns, ColumnConfig } from '../../hooks/useGroupedChannelsWithResizableColumns';
import Box from '@mui/material/Box';
import TableFooter from '@mui/material/TableFooter';

interface User {
  id?: string;
  username: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  email?: string;
  phoneNumber?: string;
  country?: string;
  stateTerritory?: string;
  role?: string;
  industry?: string;
  description?: string;
}

interface UsersListViewProps {
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  registerHandlers: (handlers: {
    handleCreateUser: () => void;
    handleEditUser: (user: User) => void;
    handleDeleteUser: (user: User) => void;
    handleRefresh: () => void;
  }) => void;
}

// Update USER_COLUMNS with new minWidth values using 'ch' units
const USER_COLUMNS: ColumnConfig[] = [
  { title: 'Username', minWidth: 12 * 8, maxWidth: 300, defaultWidth: 12 * 8, align: 'left' }, // 12ch, 1ch ~ 8px
  { title: 'First Name', minWidth: 12 * 8, maxWidth: 200, defaultWidth: 12 * 8, align: 'left' },
  { title: 'Last Name', minWidth: 12 * 8, maxWidth: 200, defaultWidth: 12 * 8, align: 'left' },
  { title: 'Email', minWidth: 15 * 8, maxWidth: 300, defaultWidth: 15 * 8, align: 'left' },
  { title: 'Organization', minWidth: 12 * 8, maxWidth: 250, defaultWidth: 12 * 8, align: 'left' },
  { title: 'Country', minWidth: 7 * 8, maxWidth: 200, defaultWidth: 7 * 8, align: 'left' }, // 7ch for header
  { title: 'Role', minWidth: 15 * 8, maxWidth: 200, defaultWidth: 15 * 8, align: 'left' },
];

const UsersListView = ({ selectedUser, setSelectedUser, registerHandlers }: UsersListViewProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { setOpen, setSeverity, setMessage } = useAlert();

  const { columnWidths, handleResize } = useGroupedChannelsWithResizableColumns({
    channels: users,
    groups: [],
    columnConfig: USER_COLUMNS,
    groupByDeployed: false,
  });
  const resizingCol = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);
  const handleResizeStart = (colIdx: number, e: React.MouseEvent) => {
    resizingCol.current = colIdx;
    startX.current = e.clientX;
    startWidth.current = columnWidths[colIdx];
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  const handleResizeMove = (e: MouseEvent) => {
    if (resizingCol.current === null) return;
    const diff = e.clientX - startX.current;
    handleResize(resizingCol.current, startWidth.current + diff);
  };
  const handleResizeEnd = () => {
    resizingCol.current = null;
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.userSelect = '';
    };
  }, []);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Track container width for proportional stretching
  useEffect(() => {
    const handleResize = () => {
      if (tableContainerRef.current) {
        setContainerWidth(tableContainerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Remove proportional stretching logic, use only columnWidths for each column
  // const totalDefaultWidth = USER_COLUMNS.reduce((sum, col, idx) => sum + columnWidths[idx], 0);
  // const actionsColWidth = 120; // Fixed width for Actions column
  // const availableWidth = Math.max(containerWidth - actionsColWidth, 0);
  // const dynamicColWidths = USER_COLUMNS.map((col, idx) => {
  //   const proportion = totalDefaultWidth > 0 ? columnWidths[idx] / totalDefaultWidth : 1 / USER_COLUMNS.length;
  //   const stretched = Math.max(col.minWidth, Math.round(availableWidth * proportion));
  //   return Math.min(stretched, col.maxWidth);
  // });

  useEffect(() => {
    fetchUsers();
    // Register handlers for context
    registerHandlers({
      handleCreateUser,
      handleEditUser,
      handleDeleteUser,
      handleRefresh: fetchUsers
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (e) {
      setUsers([]);
      setSeverity('error');
      setMessage('Failed to load users');
      setOpen(true);
    }
    setLoading(false);
  };

  const handleCreateUser = () => {
    setIsNewUser(true);
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setIsNewUser(false);
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    if (users.length === 1) {
      setSeverity('warning');
      setMessage('You must have at least one user account.');
      setOpen(true);
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleSaveUser = async (user: User, password?: string) => {
    try {
      if (isNewUser) {
        await createUser(user, password!);
        setSeverity('success');
        setMessage('User created successfully');
      } else {
        await updateUser(user, password);
        setSeverity('success');
        setMessage('User updated successfully');
      }
      setOpen(true);
      await fetchUsers();
      return true;
    } catch (error) {
      setSeverity('error');
      setMessage(error instanceof Error ? error.message : 'Failed to save user');
      setOpen(true);
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete?.id) return;
    
    try {
      await deleteUser(userToDelete.id);
      setSeverity('success');
      setMessage('User deleted successfully');
      setOpen(true);
      await fetchUsers();
    } catch (error) {
      setSeverity('error');
      setMessage(error instanceof Error ? error.message : 'Failed to delete user');
      setOpen(true);
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleRowDoubleClick = (user: User) => {
    handleEditUser(user);
  };

  const handleKeyDown = (event: React.KeyboardEvent, user: User) => {
    if (event.key === 'Delete') {
      event.preventDefault();
      handleDeleteUser(user);
    }
  };

  return (
    <>
      <Paper sx={{ width: '100%', minWidth: 0, flex: 1, overflow: 'auto', mt: 2, p: 2, boxSizing: 'border-box' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Users</Typography>
          <Button variant="contained" color="primary" onClick={handleCreateUser}>
            Create User
          </Button>
        </Stack>
        <TableContainer ref={tableContainerRef} sx={{ width: '100%' }}>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <colgroup>
              {USER_COLUMNS.map((col, idx) => (
                <col key={col.title} style={{ width: columnWidths[idx] }} />
              ))}
              <col style={{ width: 41 }} />
            </colgroup>
            <TableHead>
              <TableRow>
                {USER_COLUMNS.map((col, idx) => (
                  <TableCell
                    key={col.title}
                    align="left"
                    sx={{ p: '0 2px', width: columnWidths[idx], minWidth: col.minWidth, maxWidth: col.maxWidth, boxSizing: 'border-box' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                      <Box sx={{ flex: 1, px: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>{col.title}</Box>
                      <Box
                        sx={{
                          width: 6,
                          height: 28,
                          cursor: 'col-resize',
                          backgroundColor: '#bdbdbd',
                          '&:hover': { backgroundColor: '#1976d2' },
                          borderRadius: 1,
                          ml: 1,
                        }}
                        onMouseDown={(e) => handleResizeStart(idx, e)}
                      />
                    </Box>
                  </TableCell>
                ))}
                <TableCell sx={{ p: '0 2px', width: 41, minWidth: 41, maxWidth: 41, boxSizing: 'border-box', position: 'sticky', right: 0, background: '#fff', zIndex: 1 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={USER_COLUMNS.length + 1}>Loading...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={USER_COLUMNS.length + 1}>No users found.</TableCell></TableRow>
              ) : (
                users.map((user: any) => (
                  <TableRow 
                    key={user.id || user.username}
                    hover
                    selected={selectedUser?.id === user.id}
                    onClick={() => handleRowClick(user)}
                    onDoubleClick={() => handleRowDoubleClick(user)}
                    onKeyDown={(e) => handleKeyDown(e, user)}
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                  >
                    {USER_COLUMNS.map((col, idx) => (
                      <TableCell
                        key={col.title}
                        align="left"
                        sx={{ p: '0 2px', width: columnWidths[idx], minWidth: col.minWidth, maxWidth: col.maxWidth, boxSizing: 'border-box', textAlign: 'left' }}
                      >
                        {user[
                          col.title.replace(/\s/g, '').charAt(0).toLowerCase() + col.title.replace(/\s/g, '').slice(1)
                        ] || ''}
                      </TableCell>
                    ))}
                    <TableCell sx={{ p: '0 2px', width: 41, minWidth: 41, maxWidth: 41, boxSizing: 'border-box', position: 'sticky', right: 0, background: '#fff', zIndex: 1 }} align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <UserDialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        onSave={handleSaveUser}
        user={selectedUser}
        isNewUser={isNewUser}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete user "${userToDelete?.username}"?`}
        isLastUser={users.length === 1}
      />
    </>
  );
};

export default UsersListView; 