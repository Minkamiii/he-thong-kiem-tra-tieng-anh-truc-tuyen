package com.khanh.code.api_response;

import java.util.List;

public class TaskResponse {
    
    private List<SectionsResponse> sections;

    public List<SectionsResponse> getSections() {
        return sections;
    }

    public void setSections(List<SectionsResponse> sections) {
        this.sections =sections;
    }
}
