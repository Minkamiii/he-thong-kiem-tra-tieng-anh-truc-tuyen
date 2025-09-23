package com.khanh.code.submit;

import java.util.List;

import com.khanh.code.answer.AnswerRequest;

public class SubmitRequest {

    private String user_id;
    private String test_id;
    //private String test_type;
    //private Date submit_day;
    private List<AnswerRequest> answers;
    private List<Integer> tasks;
    private String kind;
    private int time_to_complete;
    
    public String getUser_id() {
        return user_id;
    }
    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }
    public String getTest_id() {
        return test_id;
    }
    public void setTest_id(String test_id) {
        this.test_id = test_id;
    }
    // public String getTest_type() {
    //     return test_type;
    // }
    // public void setTest_type(String test_type) {
    //     this.test_type = test_type;
    // }
    // public Date getSubmit_day() {
    //     return submit_day;
    // }
    // public void setSubmit_day(Date submit_day) {
    //     this.submit_day = submit_day;
    // }
    public List<AnswerRequest> getAnswers() {
        return answers;
    }
    public void setAnswers(List<AnswerRequest> answers) {
        this.answers = answers;
    }

    public List<Integer> getTasks() {
        return tasks;
    }
    public void setTasks(List<Integer> task) {
        this.tasks = task;
    }
    
    public String getKind() {
        return kind;
    }
    public void setKind(String kind) {
        this.kind = kind;
    }
    public int getTime_to_complete() {
        return time_to_complete;
    }
    public void setTime_to_complete(int time_to_complete) {
        this.time_to_complete = time_to_complete;
    }
    
}
