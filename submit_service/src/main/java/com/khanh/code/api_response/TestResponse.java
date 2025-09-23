package com.khanh.code.api_response;

import java.util.List;

public class TestResponse 
{

    private String testType;
    private List<TaskResponse> tasks;
    private String testName;
    
    public List<TaskResponse> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskResponse> tasks) {
        this.tasks = tasks;
    }

    public String getTestType() {
        return testType;
    }

    public void setTestType(String testType) {
        this.testType = testType;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    

}
