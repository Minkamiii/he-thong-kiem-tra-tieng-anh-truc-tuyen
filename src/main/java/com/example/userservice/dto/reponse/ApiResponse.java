package com.example.userservice.dto.reponse;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse {
    private int code=200;
    private String message="successfully";
    private Object result;

    public int getCode() {
        return code;
    }
    public void setCode(int code) {
        this.code = code;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public Object getResult() {
        return result;
    }
    public void setResult(Object result) {
        this.result = result;
    }

}
