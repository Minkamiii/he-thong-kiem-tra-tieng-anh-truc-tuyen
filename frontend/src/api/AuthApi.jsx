import axios from "axios";

const authApi = axios.create({
    baseURL: `${import.meta.env.VITE_BASE_AUTH_SERVICE_LINK}`
})

authApi.interceptors.request.use(config => {
    // const token = localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN);
    // if (token) config.body.Authorization = `Bearer ${token}`;
    return config;
})

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if(error){
            prom.resolve();
        }
        else{
            prom.resolve(token);
        }
    })
}

authApi.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error;
    const status = error.response?.status;
    const errCode = error.response?.data?.code;

    if((errCode === 1006 || status === 401) && !originalRequest._retry){
        if(isRefreshing){
            return new Promise((resolve, reject) => {
                failedQueue.push({resolve, reject});
            }).then(token => {
                const oldBody = JSON.parse(originalRequest.config.data || "{}");
                oldBody.token = token;
                originalRequest.config.data = JSON.stringify(oldBody);

                return originalRequest
            }).catch(err => {
                return Promise.resolve();
            })
        }
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem(import.meta.env.VITE_LOCAL_STORAGE_REFRESH_TOKEN);
    if(!refreshToken) return Promise.resolve();

    try{
        const response = await axios.post(`${import.meta.env.VITE_BASE_AUTH_SERVICE_LINK}/refresh`, {
            refreshToken
        })

        const newAccessToken = response.data?.result;
        if(!newAccessToken) return Promise.resolve();
        localStorage.setItem(import.meta.env.VITE_LOCAL_STORAGE_ACCESS_TOKEN, newAccessToken);

        return authApi.post(processQueue(null, newAccessToken));
    }
    catch(err){
        try{
            await axios.post(`${import.meta.env.VITE_BASE_AUTH_SERVICE_LINK}/logout`, {
                token: refreshToken
            })
        }
        catch(_){}

        localStorage.clear();
        processQueue(err, null);
        return Promise.resolve();
    }
    finally{
        isRefreshing = false;
    }

})

export default authApi;