package com.example.userservice.dto.reponse;

public class AuthenticationResponse {
    String accessToken;
    String refreshToken;
    boolean authentication;
    Object data;

    public AuthenticationResponse(String accessToken,String refreshToken, boolean authenticated, Object data) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.authentication = authenticated;
        this.data = data;
    }

    public boolean getAuthentication() {
        return authentication;
    }

    public void setAuthentication(boolean authentication) {
        this.authentication = authentication;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
