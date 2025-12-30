import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Pagination,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { Link } from "react-router-dom";
import Searching from "../components/Searching";
import { getAllUsers, addUser } from "../api/UsersApi";
import type { User, AddUserRequest } from "../api/UsersApi";

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsers = async (pageNumber: number, keyword: string) => {
    setLoading(true);
    try {
      const result = await getAllUsers(pageNumber, keyword);
      setUsers(result.data || []);
      setTotalPages(result.totalPages || 0);
      setPageSize(result.pageSize || 10);
    } catch (err) {
      console.error("Lỗi khi lấy user:", err);
      setUsers([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, searchQuery);
  }, [page, searchQuery]);

  const handleSearch = (query: string) => {
    setPage(0);
    setSearchQuery(query);
  };

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phoneNum: "",
    dob: "",
    roles: [] as string[],
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      phoneNum: "",
      dob: "",
      roles: [],
      password: "",
      confirmPassword: "",
    });
    setErrors({});
    setSubmitError(null);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0\d{9}|\+84\d{9})$/;

    if (!formData.username) newErrors.username = "Please enter username";
    if (formData.username.length < 6) newErrors.username = "Username must be at least 6 characters long";
    if (!formData.email) newErrors.email = "Please enter email";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phoneNum) newErrors.phoneNum = "Please enter phone number";
    else if (!phoneRegex.test(formData.phoneNum)) newErrors.phoneNum = "Number phone invalid";
    if (!formData.dob) newErrors.dob = "Please select date of birth";
    if (!formData.roles.length) newErrors.roles = "Please select role";

    if (!formData.password) newErrors.password = "Please enter password";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters long";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please enter confirm password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const newUserData: AddUserRequest = {
      username: formData.username,
      email: formData.email,
      phoneNum: formData.phoneNum,
      dob: formData.dob,
      roles: formData.roles,
      password: formData.password,
    };

    try {
      await addUser(newUserData);
      alert("Add user successfully.");
      handleClose();
      fetchUsers(page, searchQuery);
    } catch (err: any) {
      console.error("Lỗi khi thêm user:", err);
      setSubmitError(
        "Only super admin can add user"
        // err.response?.data?.message || "Failed to add user"
      );
    }
  };

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage - 1);
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5" sx={{ mb: 2, color: "primary.main", fontWeight: "bold" }}>List User</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add User
        </Button>
      </Box>

      {/* Ô tìm kiếm */}
      <Box mb={2}>
        <Searching onSearch={handleSearch} />
      </Box>

      {/* Bảng danh sách user */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Email</TableCell>
              {/* <TableCell>Thao tác</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((u, index) => (
                <TableRow key={u.id}>
                  <TableCell>{index + 1 + page * pageSize}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.roles}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/users/${u.id}`}
                      variant="outlined"
                      size="small"
                    >
                      See details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page + 1}
            onChange={handleChangePage}
            color="primary"
          />
        </Box>
      )}

      {/* Form thêm user */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Username"
            name="username"
            fullWidth
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            name="phoneNum"
            fullWidth
            value={formData.phoneNum}
            onChange={handleChange}
            error={!!errors.phoneNum}
            helperText={errors.phoneNum}
          />
          <TextField
            margin="dense"
            label="Date of Birth"
            name="dob"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.dob}
            onChange={handleChange}
            error={!!errors.dob}
            helperText={errors.dob}
          />
          <TextField
            margin="dense"
            label="Role"
            name="roles"
            select
            fullWidth
            value={formData.roles[0] || ""}
            onChange={(e) =>
              setFormData({ ...formData, roles: [e.target.value] })
            }
            error={!!errors.roles}
            helperText={errors.roles}
          >
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="USER">User</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
          />
          <TextField
            margin="dense"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
          />
          {submitError && (
            <Box mt={1} color="red">
              {submitError}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
