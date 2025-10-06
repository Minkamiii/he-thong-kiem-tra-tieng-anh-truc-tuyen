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

  // Fetch users khi load component
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Lỗi khi lấy user:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Sử dụng useEffect để tải dữ liệu lần đầu khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Search
  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  const filteredUsers = (users || []).filter(
    (u) => u?.username && u.username.toLowerCase().includes(searchQuery)
  );


  // Form add user
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
      roles: [] as string[],
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
    console.log("Changing", e.target.name, "to", e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.username) newErrors.username = "Vui lòng nhập username";
    if (!formData.email) newErrors.email = "Vui lòng nhập email";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Email không hợp lệ";

    if (!formData.phoneNum) newErrors.phoneNum = "Vui lòng nhập số điện thoại";
    if (!formData.dob) newErrors.dob = "Vui lòng chọn ngày sinh";
    if (!formData.roles) newErrors.roles = "Vui lòng chọn role";

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

    console.log("Submitting form with data:", formData);
    const newUserData: AddUserRequest = {
      username: formData.username,
      email: formData.email,
      phoneNum: formData.phoneNum,
      dob: formData.dob,
      roles: formData.roles,
      password: formData.password,
    };

    try {
      const newUser = await addUser(newUserData);
      setUsers((prev) => [...prev, newUser]);
      alert("Thêm user thành công.");
      handleClose();
      await fetchUsers(); // Tải lại danh sách user sau khi thêm
    } catch (err: any) {
      console.error("Lỗi khi thêm user:", err);
      setSubmitError(
        err.response?.data?.message || "Không thể thêm user, vui lòng thử lại"
      );
    }
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <h2>List User</h2>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
          Add User
        </Button>
      </Box>

      {/* Search box */}
      <Box mb={2}>
        <Searching onSearch={handleSearch} />
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u, index) => (
                <TableRow key={u.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/users/${u.id}`}
                      variant="outlined"
                      size="small"
                    >
                      See detail
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

      {/* Form Add User */}
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
            value={formData.roles[0] || ""}   // lấy phần tử đầu
            onChange={(e) => setFormData({ ...formData, roles: [e.target.value] })} 
            error={!!errors.roles}
            helperText={errors.roles}
          >
            <MenuItem value="SuperAdmin">SuperAdmin</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="User">User</MenuItem>
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
          <Button onClick={handleClose}>Close</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
