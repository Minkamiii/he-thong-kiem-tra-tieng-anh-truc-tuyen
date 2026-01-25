package com.example.userservice.dto.request;

import java.util.List;

public class UserIdListRequest {
    List<String> userIds;
    public List<String> getUserIds() {
        return userIds;
    }
    public void setUserIds(List<String> userIds) {
        this.userIds = userIds;
    }
}
