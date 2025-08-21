package com.khanh.code.api_response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse {
    
    private int status;
    private String message;
    private Object data;
    
    public int getStatus() {
        return status;
    }
    public String getMessage() {
        return message;
    }
    public ApiResponse(){

    }
    public void setMessage(String mess){
        this.message=mess;
    }

    public Object getData() {
        return data;
    }
    public void setData(Object data) {
        this.data = data;
    }
    public void setStatus(int status){
        this.status=status;
    }

}
