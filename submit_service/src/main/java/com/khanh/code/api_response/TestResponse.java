package com.khanh.code.api_response;

import java.util.List;

public class TestResponse 
{

    private String type;
    private List<TaskResponse> tasks;

    public String getType() {
        return type;
    }

    public void setType(String testType) {
        this.type = testType;
    }
    
    public List<TaskResponse> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskResponse> tasks) {
        this.tasks = tasks;
    }

}
