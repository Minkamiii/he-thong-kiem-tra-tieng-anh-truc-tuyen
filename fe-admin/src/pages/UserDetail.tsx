import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  TextField,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const currentUser = localStorage.getItem("userId");
  const isSelf = currentUser === id;

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("Không tìm thấy ID người dùng.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
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
        <Typography>Loading...</Typography>
      </Stack>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" color="error" sx={{ textAlign: "center", mt: 2 }}>
        {error}
      </Typography>
    );
  }

  if (!user) {
    return (
      <Typography variant="h6" sx={{ textAlign: "center", mt: 2 }}>
        User does not exist
      </Typography>
    );
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(0\d{9}|\+84\d{9})$/;

    if (!formData?.username?.trim()) newErrors.username = "Please enter username";
    if (formData?.username && formData.username.length < 5) newErrors.username = "Username must be at least 5 characters long";
    if (!formData?.email?.trim()) newErrors.email = "Please enter email";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Email invalid";
    if (!formData?.phoneNum?.trim()) newErrors.phoneNum = "Please enter number phone";
    else if (!phoneRegex.test(formData.phoneNum))
      newErrors.phoneNum = "Number phone invalid";
    if (!formData?.dob?.trim()) newErrors.dob = "Please choose date of birth";
    if (!formData?.roles?.length) newErrors.roles = "Please choose role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteUser(id);
      navigate("/users");
      alert("Delete user successfully.");
    } catch (err:any) {
      console.error("Failed to delete user:", error);
      if (err.response.data.code == 9999) {
        setSubmitError(
          "Only super admin delete user"
        );
        alert("Only super admin can delete user")
      } else {
        setSubmitError(
          err.response?.data?.message || "Failed to delete user"
        );
      }
      // console.log("Delete user failed")
      navigate(-1)
    }
  };

  const handleUpdate = async () => {
    if (!formData || !id) return;
    if (!validateForm()) return;

    const rolesToUpdate = isSelf ? user.roles : formData.roles;

    const updatedUser: AddUserRequest = {
      username: formData.username,
      password: formData.password || "",
      email: formData.email,
      phoneNum: formData.phoneNum,
      dob: formData.dob,
      roles: rolesToUpdate,
    };

    try {
      const result = await updateUser(id, updatedUser);
      setUser(result);
      setFormData(result);
      setIsEditing(false);
      alert("Update user successfully.");
      navigate("/users");
    } catch (err:any) {
      if (err.response.data.code == 9999) {
        setSubmitError(
          "Only super admin can update user"
        );
        alert("Only super admin can update user")
      } else {
        setSubmitError(
          err.response?.data?.message || "Failed to update user"
        );
      }
      navigate(-1)
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
              error={!!errors.username}
              helperText={errors.username}
            />
            <TextField
              label="Email"
              value={formData?.email || ""}
              onChange={(e) =>
                setFormData((prev) => prev && { ...prev, email: e.target.value })
              }
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Phone Number"
              value={formData?.phoneNum || ""}
              onChange={(e) =>
                setFormData((prev) => prev && { ...prev, phoneNum: e.target.value })
              }
              error={!!errors.phoneNum}
              helperText={errors.phoneNum}
            />
            <TextField
              label="Date of Birth"
              type="date"
              value={formData?.dob || ""}
              onChange={(e) =>
                setFormData((prev) => prev && { ...prev, dob: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
              error={!!errors.dob}
              helperText={errors.dob}
            />

            <FormControl fullWidth error={!!errors.roles}>
              <InputLabel id="roles-label">Roles</InputLabel>
              <Select
                labelId="roles-label"
                id="roles-select"
                value={formData?.roles?.[0] || ""}
                onChange={(e) => {
                  const value = e.target.value as string;
                  setFormData((prev) => prev && { ...prev, roles: [value] });
                }}
                label="Roles"
                disabled={isSelf}
              >
                {isSelf && <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>}
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="USER">User</MenuItem>
              </Select>
              {errors.roles && (
                <Typography color="error" fontSize={13} sx={{ mt: 0.5 }}>
                  {errors.roles}
                </Typography>
              )}
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
                  if (user) setFormData(user);
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
            {!isSelf && (
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}
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
