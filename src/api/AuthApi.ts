import axiosClient from "./AxiosClient";

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  userId: string;
  accessToken: string;
  refreshToken: string;
  authentication: boolean;
};

export type LogoutRequest = {
  accessToken: string;
};

const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // Không cần AxiosResponse nữa vì interceptor đã return response.data
    const res: {
      code: number;
      message: string;
      result: LoginResponse;
    } = await axiosClient.post("/api/auth/loginAdmin", data);
    
    // Không còn dùng res.data, mà dùng trực tiếp res.result
    const { userId, accessToken, refreshToken, authentication } = res.result;

    return { userId, accessToken, refreshToken, authentication };
  },

  logout: async (data: LogoutRequest): Promise<void> => {
    const res: {
      code: number;
      message: string;
      result: LoginResponse;
    } = await axiosClient.post("/api/auth/logout", data);
    return;
  },
};



export default authApi;
