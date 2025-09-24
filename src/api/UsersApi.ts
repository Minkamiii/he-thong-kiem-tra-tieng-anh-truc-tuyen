// src/api/UserApi.ts
import axiosClient from "./AxiosClient";

export type User = {
  id: string;
  username: string;
  password: string;
  email: string;
  phoneNum: string;
  dob: string;
  roles: string[] | null;
}

// Kiểu dữ liệu khi thêm user (không có id)
export type AddUserRequest = {
  username: string;
  password: string;
  email: string;
  phoneNum: string;
  dob: string;
  roles: string[] | null;
}

// export const getAllUsers = async (): Promise<User[]> => {
//   const res = await axiosClient.get<User[]>("/api/user/getAll");
//   console.log("API raw response:", res);
//   console.log("res.data:", res.data);
//   return res.data.results;
// };

  export const getAllUsers = async (): Promise<User[]> => {
    const res:{
      code: number;
      message: string;
      result: User[];
    } = await axiosClient.get("/api/user/getAll");
    console.log("API raw response:", res);
    console.log("res.results:", res.result);
    return res.result;
  };

  export const getUsers = async (data: { id: string }): Promise<User | null> => {
    const res:{
      code: number;
      message: string;
      result: User | null;
    } = await axiosClient.get(`/api/user/info/${data.id}`);
    console.log("API raw response:", res);
    console.log("res.results:", res.result);
    return res.result;
  };

// Add user chỉ nhận AddUserRequest, không cần id
  export const addUser = async (user: AddUserRequest): Promise<User> => {
    const res = await axiosClient.post<User>("/api/user/register", user);
    return res.data;
  };

  export const updateUser = async ( id: string, user: AddUserRequest): Promise<User> => {
    const res = await axiosClient.put<User>(`/api/user/update/${id}`, user);
    console.log(res.data)
    return res.data;
  }

  export const deleteUser = async (id: string): Promise<void> => {
    try{ 
      await axiosClient.delete(`/api/user/delete/${id}`);
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error; // Rethrow the error after logging it
    }
  }

