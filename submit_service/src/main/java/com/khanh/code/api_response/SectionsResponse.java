package com.khanh.code.api_response;

import java.util.List;

public class SectionsResponse {
    
    private List<QuestionResponse>questions;

    public List<QuestionResponse> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuestionResponse> questions) {
        this.questions = questions;
    }
}
