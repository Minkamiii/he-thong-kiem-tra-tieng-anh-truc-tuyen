package com.khanh.code.submit;

import java.text.SimpleDateFormat;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class SubmitDTO {
    private String id;
    private String id_user;
    private String type;
    private String id_test;
    private String submit_day;
    private String kind;
    private String testName;

    private List<Integer> tasks;
    // int float always default 0 => class for writing with no correct answer and question answered
    
    private Integer numCorrectAnswers;
    private Integer num_Of_Answered_Questions;
    private int total_Requirement_to_answer;
    private String time_to_complete;
    
    //private Float score;

    public SubmitDTO(Submit submit) 
    {
        this.id = submit.getId();
        this.id_user = submit.getId_user();
        this.type = submit.getType().toString();
        this.id_test = submit.getId_test();
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss dd/MM/yyyy");
        this.submit_day = sdf.format(submit.getSubmit_day());  
        this.tasks=submit.getTasks();
        this.kind=submit.getKind().toString();
        this.total_Requirement_to_answer=submit.getTotal_Requirement_to_answer();
        this.testName=submit.getTestName();
        this.time_to_complete=formatTime(submit.getTime_to_complete());
               
        if (submit.getType() == Submit.Type.LISTENING) {
            Submit_Listening listeningSubmit = (Submit_Listening) submit;
            this.setNumCorrectAnswers(listeningSubmit.getNumber_of_correct());
            this.setNumOfAnsweredQuestion(listeningSubmit.getNum_of_question_to_answer());
            //this.setScore(listeningSubmit.getScore());
        }

        else if (submit.getType() == Submit.Type.READING) {
            Submit_Reading readingSubmit=(Submit_Reading) submit;
            this.setNumCorrectAnswers(readingSubmit.getNumber_of_correct());
            this.setNumOfAnsweredQuestion(readingSubmit.getNum_of_question_to_answer());
            //this.setScore(readingSubmit.getScore());
        }
    }

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getId_user() {
        return id_user;
    }
    public void setId_user(String id_user) {
        this.id_user = id_user;
    }
    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }
    public String getId_test() {
        return id_test;
    }
    public void setId_test(String id_test) {
        this.id_test = id_test;
    }
    public String getSubmit_day() {
        return submit_day;
    }
    public void setSubmit_day(String submit_day) {
        this.submit_day = submit_day;
    }

    public Integer getNumCorrectAnswers() {
        return numCorrectAnswers;
    }

    public void setNumCorrectAnswers(int numCorrectAnswers) {
        this.numCorrectAnswers = numCorrectAnswers;
    }

    public Integer getNumOfAnsweredQuestions() {
        return num_Of_Answered_Questions;
    }

    public void setNumOfAnsweredQuestion(Integer numOfAnswer) {
        this.num_Of_Answered_Questions = numOfAnswer;
    }

    public List<Integer> getTasks() {
        return tasks;
    }

    public void setTasks(List<Integer> tasks) {
        this.tasks = tasks;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public int getTotal_Requirement_to_answer() {
        return total_Requirement_to_answer;
    }

    public void setTotal_Requirement_to_answer(int total_Requirement_to_answer) {
        this.total_Requirement_to_answer = total_Requirement_to_answer;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public String getTime_to_complete() {
        return time_to_complete;
    }

    public void setTime_to_complete(String time_to_complete) {
        this.time_to_complete = time_to_complete;
    }
    
    private String formatTime(int totalSeconds) {
        int hours = totalSeconds / 3600;
        int minutes = (totalSeconds % 3600) / 60;
        int seconds = totalSeconds % 60;
        return String.format("%02d:%02d:%02d", hours, minutes, seconds);
    }
    // public float getScore() {
    //     return score;
    // }

    // public void setScore(float score) {
    //     this.score = score;
    // }
}
