package com.khanh.code.answer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import java.util.Map;

import com.khanh.code.submit.Submit;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.CollectionTable;

@Entity
public class Answer_Choice extends Answer {

    public Answer_Choice() {}   

    @ElementCollection
    @CollectionTable(name = "answer_choices", joinColumns = @JoinColumn(name = "answer_id"))
    @MapKeyColumn(name = "choice_initial_index")
    @Column(name = "correct")

    private Map<Integer, Boolean> choices;
    
    private boolean isCorrect;

    public Answer_Choice(String id_question, Submit submit,Type type,
    Map<Integer, Boolean> answer) {
        super(id_question, submit,type);
        this.choices = answer;
    }

    public Map<Integer, Boolean> getAnswer() {
        return choices;
    }

    public void setAnswer(Map<Integer, Boolean> choices) {
        this.choices = choices;
    }

    public boolean isCorrect() 
    {
        return isCorrect;
    }

    public void setCorrect(boolean correct) {
        this.isCorrect = correct;
    }
    
    public boolean checkChoices(){
        for (Integer choiceId : this.choices.keySet()) {
            boolean isCorrect = choices.get(choiceId);
            if(isCorrect==false){
                return false;
            }
        }

        return true;
    }

}