package com.example.userservice.dto.reponse;

public class RefreshTokenReponse {
    String refreshToken;

    public RefreshTokenReponse(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
}
