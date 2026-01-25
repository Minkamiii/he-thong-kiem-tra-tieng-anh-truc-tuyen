package com.khanh.code.submit;

import java.util.Date;
import java.util.List;

import jakarta.persistence.Entity;

@Entity
public class Submit_Listening extends Submit {

    private int number_of_correct;
    //private float score;

    public Submit_Listening() {}

    public Submit_Listening(String id_user, 
    String id_test,Type type,List<Integer>tasks, Date submit_day, int number_of_correct) {
        super(id_user, id_test, submit_day,type,tasks);
        this.number_of_correct = number_of_correct;
        //this.score = score;
    }

    public int getNumber_of_correct() {
        return number_of_correct;
    }

    public void setNumber_of_correct(int number_of_correct) {
        this.number_of_correct = number_of_correct;
    }

    // public float getScore() {
    //     return score;
    // }

    // public void setScore(float score) {
    //     this.score = score;
    // }

}
