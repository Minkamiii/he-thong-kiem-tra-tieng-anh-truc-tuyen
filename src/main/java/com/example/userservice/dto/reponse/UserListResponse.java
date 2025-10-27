package com.example.userservice.dto.reponse;

public class UserListResponse {
    String userId;
    String username;

    public UserListResponse(String userId, String username) {
        this.userId = userId;
        this.username = username;
    }
    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }
    public String getUsername() {
        return username;
    }
    public void setUsername(String username) {
        this.username = username;
    }
}
