package com.khanh.code.answer;

import com.khanh.code.submit.Submit;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;

@Entity
public class Answer_Essay extends Answer {

    public Answer_Essay() {}

    @Lob
    @Column(columnDefinition = "TEXT") 
    private String answer;

    //Save recommendation from AI system
    @Lob
    @Column(columnDefinition = "TEXT") 
    private String aiRecommend;

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

    public String getAiRecommend() {
        return aiRecommend;
    }

    public void setAiRecommend(String aiRecommend) {
        this.aiRecommend = aiRecommend;
    }

}
