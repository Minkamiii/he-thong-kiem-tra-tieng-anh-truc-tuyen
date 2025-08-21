package com.khanh.code.answer;

import com.khanh.code.submit.Submit;

import jakarta.persistence.Entity;

@Entity
public class Answer_Essay extends Answer {

    public Answer_Essay() {}
    private String answer;

    public Answer_Essay(String id_question, Submit submit,Type type, String answer) {
        super(id_question, submit,type);
        this.answer = answer;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

}
