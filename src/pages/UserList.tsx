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

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // 🔹 Lấy danh sách user theo trang và keyword
  const fetchUsers = async (pageNumber: number, keyword: string) => {
    setLoading(true);
    try {
      const result = await getAllUsers(pageNumber, keyword);
      // Giả sử API trả về: { content: User[], totalPages: number, totalItems: number, pageSize: number }
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

  // Load dữ liệu ban đầu
  useEffect(() => {
    fetchUsers(page, searchQuery);
  }, [page, searchQuery]);

  // 🔹 Tìm kiếm
  const handleSearch = (query: string) => {
    setPage(0); // reset page
    setSearchQuery(query);
  };

  // --- Form Add User ---
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

    if (!formData.username) newErrors.username = "Vui lòng nhập username";
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.phoneNum) newErrors.phoneNum = "Vui lòng nhập số điện thoại";
    if (!formData.dob) newErrors.dob = "Vui lòng chọn ngày sinh";
    if (!formData.roles.length) newErrors.roles = "Vui lòng chọn role";

    if (!formData.password) newErrors.password = "Vui lòng nhập mật khẩu";
    else if (formData.password.length < 8)
      newErrors.password = "Mật khẩu tối thiểu 8 ký tự";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Mật khẩu không khớp";

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
      await addUser(newUserData); // giả sử addUser chỉ cần 1 tham số
      alert("Thêm user thành công.");
      handleClose();
      fetchUsers(page, searchQuery); // reload danh sách
    } catch (err: any) {
      console.error("Lỗi khi thêm user:", err);
      setSubmitError(
        err.response?.data?.message || "Không thể thêm user, vui lòng thử lại"
      );
    }
  };

  // --- Xử lý chuyển trang ---
  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage - 1); // backend page bắt đầu từ 0
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">List User</Typography>
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
              <TableCell>Email</TableCell>
              <TableCell>Thao tác</TableCell>
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
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/users/${u.id}`}
                      variant="outlined"
                      size="small"
                    >
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Không tìm thấy user nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
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
        <DialogTitle>Thêm User</DialogTitle>
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
            <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
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
          <Button onClick={handleClose}>Đóng</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
