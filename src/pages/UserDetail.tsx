import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  CircularProgress,
  Select,      // This was also missing in your previous version
  MenuItem,    // This was also missing
  InputLabel,  // This was also missing
  FormControl,
  Box,
} from "@mui/material";
import { useState, useEffect } from "react";
import { getUsers, deleteUser, updateUser } from "../api/UsersApi";
import type { User, AddUserRequest } from "../api/UsersApi";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);


  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("Không tìm thấy ID người dùng.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Thay đổi cách gọi hàm getUsers để truyền id trực tiếp (đã sửa ở câu trả lời trước)
        const userData = await getUsers({ id: id as string });
        if (userData) {
          setUser(userData);
          setFormData(userData);
        } else {
          setError("User không tồn tại hoặc lỗi server.");
        }
      } catch (err) {
        setError("Không thể tải dữ liệu người dùng.");
        console.error("API call failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ marginTop: "20px" }}>
        <CircularProgress />
        <Typography>Đang tải...</Typography>
      </Stack>
    );
  }

  if (error) {
    return <Typography variant="h6" color="error" sx={{ textAlign: 'center', mt: 2 }}>{error}</Typography>;
  }

  if (!user) {
    return <Typography variant="h6" sx={{ textAlign: 'center', mt: 2 }}>User không tồn tại</Typography>;
  }

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteUser(id);
      navigate("/users");
      alert("Xóa người dùng thành công.");
    } catch (error) {
      console.error("Failed to delete user:", error);
      // Hiển thị thông báo lỗi cho người dùng
      setError("Xóa người dùng thất bại.");
    }
  };

  const handleUpdate = async () => {
    if (!formData || !id) return;
    
    // Tạo đối tượng AddUserRequest từ formData để truyền vào API
    const updatedUser: AddUserRequest = {
        username: formData.username,
        password: formData.password, // Cẩn thận với trường password
        email: formData.email,
        phoneNum: formData.phoneNum,
        dob: formData.dob,
        roles: formData.roles,
    };

    try {
      // Gọi hàm updateUser từ API
      const result = await updateUser(id, updatedUser);
      
      // Cập nhật lại state user và formData với dữ liệu mới từ server
      setUser(result);
      setFormData(result);
      setIsEditing(false); // Thoát khỏi chế độ chỉnh sửa
      alert("Cập nhật người dùng thành công.");
      navigate("/users");
    } catch (error:any) {
      setSubmitError(error.response?.data?.message || "Cập nhật người dùng thất bại.");
      
    }
  };

  return (
    <Card
      sx={{
        maxWidth: 500,
        margin: "20px auto",
        padding: 2,
        boxShadow: 3,
        textAlign: "center",
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom>
          User details
        </Typography>

        {!isEditing ? (
          <>
            <Typography>
              <b>ID:</b> {user.id}
            </Typography>
            <Typography>
              <b>Username:</b> {user.username}
            </Typography>
            <Typography>
              <b>Email:</b> {user.email}
            </Typography>
            <Typography>
              <b>Phone Number:</b> {user.phoneNum}
            </Typography>
            <Typography>
              <b>Date of Birth:</b> {user.dob}
            </Typography>
            <Typography>
              <b>Role:</b> {user.roles ? user.roles.join(", ") : "N/A"}
            </Typography>
          </>
        ) : (
          <Stack spacing={2} mt={2}>
            <TextField
              label="Username"
              value={formData?.username || ""}
              onChange={(e) =>
                setFormData((prev) => prev && { ...prev, username: e.target.value })
              }
            />
            <TextField
              label="Email"
              value={formData?.email || ""}
              onChange={(e) =>
                setFormData((prev) => prev && { ...prev, email: e.target.value })
              }
            />
            <TextField
              label="Phone Number"
              value={formData?.phoneNum || ""}
              onChange={(e) =>
                setFormData(
                  (prev) => prev && { ...prev, phoneNum: e.target.value }
                )
              }
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={formData?.dob || ""}
              onChange={(e) =>
                setFormData(
                  (prev) => prev && { ...prev, dob: e.target.value }
                )
              }
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel id="roles-label">Roles</InputLabel>
              {/* <Select
                labelId="roles-label"
                id="roles-select"
                multiple // Cho phép chọn nhiều vai trò
                value={formData?.roles || []}
                onChange={(e) => {
                  const value = e.target.value as string[];
                  setFormData((prev) => prev && { ...prev, roles: value });
                }}
                label="Roles"
                renderValue={(selected) => selected.join(', ')} // Hiển thị các giá trị đã chọn
              > */}
              <Select
                labelId="roles-label"
                id="roles-select"
                value={formData?.roles?.[0] || ""} // chỉ lấy 1 role
                onChange={(e) => {
                  const value = e.target.value as string;
                  setFormData((prev) => prev && { ...prev, roles: [value] }); // ép thành mảng 1 phần tử
                }}
                label="Roles"
              >
                <MenuItem value="SuperAdmin">Super Admin</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="User">User</MenuItem>
              </Select>
            </FormControl>
            {submitError && (
              <Box mt={1} color="red">
                  {submitError}
                </Box>
            )}
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="contained" color="primary" onClick={handleUpdate}>
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                    setIsEditing(false);
                    // Reset formData về user ban đầu nếu thoát mà không lưu
                    if(user) setFormData(user);
                }}
              >
                Back
              </Button>
            </Stack>
          </Stack>
          
        )}

        {!isEditing && (
          <Stack spacing={2} mt={3} alignItems="center">
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setIsEditing(true)}
            >
              Update
            </Button>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => navigate("/users")}
            >
              Back
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}