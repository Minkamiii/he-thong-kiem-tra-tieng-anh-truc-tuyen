package com.example.userservice.dto.reponse;

public class AuthenticationResponse {
    String token;
    boolean authentication;
    Object data;

    public AuthenticationResponse(String token2, boolean authenticated) {
        this.token = token2;
        this.authentication = authenticated;
    }

    public AuthenticationResponse(String token2, boolean authenticated, Object data) {
        this.token = token2;
        this.authentication = authenticated;
        this.data = data;
    }

    public AuthenticationResponse() {
}

    public boolean getAuthentication() {
        return authentication;
    }

    public void setAuthentication(boolean authentication) {
        this.authentication = authentication;
    }
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

        public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
