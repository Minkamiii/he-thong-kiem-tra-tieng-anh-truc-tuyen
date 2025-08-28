package com.khanh.code.answer;


public class AnswerRequest {
    
    private String id_question;
    //private String type;
    private Object answer;

    public String getId_question() {
        return id_question;
    }
    public void setId_question(String id_question) {
        this.id_question = id_question;
    }
    // public String getType() {
    //     return type;
    // }
    // public void setType(String type) {
    //     this.type = type;
    // }
    public Object getAnswer() {
        return answer;
    }
    public void setAnswer(Object answer) {
        this.answer = answer;
    }
}
