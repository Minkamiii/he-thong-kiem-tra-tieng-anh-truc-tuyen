package com.khanh.code.answer;

import com.fasterxml.jackson.annotation.JsonInclude;


@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnswerDTO {
    private String answer_id;
    private String type;
    private String id_question;
    private Object answer;
    private Boolean correct;
    private int number_of_requiremient_to_answer;

    public AnswerDTO(Answer answer){
        this.answer_id=answer.getId();
        this.type=answer.getType().toString();
        this.id_question=answer.getId_question();
        this.number_of_requiremient_to_answer=answer.getNumber_of_requiremient_to_answer();

        if(answer.getType()==Answer.Type.CHOICE){
                Answer_Choice answer_Choice= (Answer_Choice) answer;
                this.setAnswer(answer_Choice.getAnswer());
                //this.setcorrect(answer_Choice.isCorrect());
            }

        else if(answer.getType()==Answer.Type.FILL){
                Answer_Fill answer_Fill= (Answer_Fill) answer;
                this.setAnswer(answer_Fill.getAnswer());
                this.setcorrect(answer_Fill.isCorrect());
            }

        else if(answer.getType()==Answer.Type.ESSAY){
                Answer_Essay answer_Essay=(Answer_Essay) answer;
                this.setAnswer(answer_Essay.getAnswer());
            }
        
    }

    public String getAnswer_id() {
        return answer_id;
    }

    public void setAnswer_id(String answer_id) {
        this.answer_id = answer_id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getId_question() {
        return id_question;
    }

    public void setId_question(String id_question) {
        this.id_question = id_question;
    }

    public Object getAnswer() {
        return answer;
    }

    public void setAnswer(Object answer) {
        this.answer = answer;
    }

    public Boolean getcorrect() {
        return correct;
    }

    public void setcorrect(Boolean correct) {
        this.correct = correct;
    }

    public int getNumber_of_requiremient_to_answer() {
        return number_of_requiremient_to_answer;
    }

    public void setNumber_of_requiremient_to_answer(int number_of_requiremient_to_answer) {
        this.number_of_requiremient_to_answer = number_of_requiremient_to_answer;
    }

    
}
