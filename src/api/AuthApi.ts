import axiosClient from "./AxiosClient";

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  authentication: boolean;
};

const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // Không cần AxiosResponse nữa vì interceptor đã return response.data
    const res: {
      code: number;
      message: string;
      result: LoginResponse;
    } = await axiosClient.post("/api/auth/admin", data);

    // ✅ Không còn dùng res.data, mà dùng trực tiếp res.result
    const { token, authentication } = res.result;

    return { token, authentication };
  },
};



export default authApi;
