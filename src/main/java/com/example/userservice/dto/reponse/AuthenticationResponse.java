package com.example.userservice.dto.reponse;

public class AuthenticationResponse {
    boolean authentication;
    Object data;

    public AuthenticationResponse(boolean authenticated, Object data) {
        this.authentication = authenticated;
        this.data = data;
    }

    public boolean getAuthentication() {
        return authentication;
    }

    public void setAuthentication(boolean authentication) {
        this.authentication = authentication;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
