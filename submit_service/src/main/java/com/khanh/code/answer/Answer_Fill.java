package com.khanh.code.answer;

import com.khanh.code.submit.Submit;

import jakarta.persistence.Entity;

@Entity
public class Answer_Fill extends Answer {

    public Answer_Fill() {}   

    private boolean correct;
    private String answer;

    public Answer_Fill(String id_question, Submit submit,Type type, boolean correct, String answer) {
        super(id_question, submit,type);
        this.correct = correct;
        this.answer = answer;
    }

    public boolean isCorrect() {
        return correct;
    }

    public void setCorrect(boolean correct) {
        this.correct = correct;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }
}

