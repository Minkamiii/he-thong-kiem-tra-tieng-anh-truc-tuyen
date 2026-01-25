import axiosClient from "./AxiosClient";

export type User = {
  id: string;
  username: string;
  password: "";
  email: string;
  phoneNum: string;
  dob: string;
  roles: string[];
}

export type AddUserRequest = {
  username: string;
  password: string;
  email: string;
  phoneNum: string;
  dob: string;
  roles: string[] | null;
}

export interface listUsersResponse {
  data: User[];
  currentItems: number;
  pageSize: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export async function getAllUsers(page = 0, keyword = ""): Promise<listUsersResponse> {
  const res: {
    code: number;
    message: string;
    result: listUsersResponse;
  } = await axiosClient.get(`api/user/getAll?page=${page}${keyword ? `&keyword=${keyword}` : ""}`);
  return res.result;
}

export const getUsers = async (data: { id: string }): Promise<User | null> => {
  const res: {
    code: number;
    message: string;
    result: User | null;
  } = await axiosClient.get(`/api/user/${data.id}`);
  return res.result;
};

export const addUser = async (user: AddUserRequest): Promise<User> => {
  // console.log("Adding user:", user);
  const res = await axiosClient.post<User>("/api/user/adduser", user);
  // console.log("Added user response:", res);
  return res.data;
};

export const updateUser = async (id: string, user: AddUserRequest): Promise<User> => {
  const { ...payload } = user;
  try {
    const res = await axiosClient.put<User>(`/api/user/updateAdmin/${id}`, payload);
    // console.log("Updated user response:", res);
    return res.data;
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
}

export const deleteUser = async (id: string): Promise<void> => {
  try {
    await axiosClient.delete(`/api/user/delete/${id}`);
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error;
  }
}

