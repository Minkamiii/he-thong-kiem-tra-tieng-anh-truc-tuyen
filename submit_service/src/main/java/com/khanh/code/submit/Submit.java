package com.khanh.code.submit;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

//import java.util.Map;
import com.khanh.code.answer.Answer_Choice;
import org.hibernate.annotations.UuidGenerator;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.khanh.code.answer.Answer;
import com.khanh.code.answer.Answer_Fill;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)

public class Submit {

    public Submit(){}

    public enum Type{
        WRITING, LISTENING, READING
    }

    public enum Kind{
        PRACTICE,
        EXAM
    }

    @Id
    @UuidGenerator(style = UuidGenerator.Style.RANDOM)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @Enumerated(EnumType.STRING)
    private Type type;

    @Enumerated(EnumType.STRING)
    private Kind kind;
    
    @NotNull
    private String id_user;
    @NotNull
    private String id_test;
    @NotNull
    private Date submit_day;

    //To get tasks that have been chosen when in front end 
    @ElementCollection
    @Column(name="chosen_task")
    @NotNull
    @NotEmpty
    private List<Integer> tasks = new ArrayList<>();

    private int num_of_question_to_answer;

    private int total_Requirement_to_answer;

    @OneToMany(mappedBy = "submit", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Answer> answers = new ArrayList<>();

    public Submit(String id_user,String id_test, 
    Date submit_day, Type type,List<Integer>tasks) {
        this.id_user = id_user;
        this.id_test = id_test;
        this.submit_day = submit_day;
        this.type=type;
        this.tasks=tasks;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public String getId_user() {
        return id_user;
    }

    public void setId_user(String id_user) {
        this.id_user = id_user;
    }

    public String getId_test() {
        return id_test;
    }

    public void setId_test(String id_test) {
        this.id_test = id_test;
    }
    
    public Date getSubmit_day() {
        return submit_day;
    }

    public void setSubmit_day(Date submit_day) {
        this.submit_day = submit_day;
    }

    public List<Answer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<Answer> answers) {
        this.answers = answers;
    }
    

    public int getNum_of_question_to_answer() {
        return num_of_question_to_answer;
    }

    public void setNum_of_question_to_answer() {
        this.num_of_question_to_answer = this.answers.size();
    }

    // public void setNum_of_question_to_answer(int num_of_question_to_answer) {
    //     this.num_of_question_to_answer = num_of_question_to_answer;
    // }

    public List<Integer> getTasks() {
        return tasks;
    }

    public void setTasks(List<Integer> tasks) {
        this.tasks = tasks;
    }

    public Kind getKind() {
        return kind;
    }

    public void setKind(Kind kind) {
        this.kind = kind;
    }

    public int getTotal_Requirement_to_answer() {
        return total_Requirement_to_answer;
    }

    public void setTotal_Requirement_to_answer(int total_Requirement_to_answer) {
        this.total_Requirement_to_answer = total_Requirement_to_answer;
    }

    //calculate number of correct answers
    public int calculateNumCorrectAnswers(Submit submit) {
        int dem=0;
        List<Answer> answers = submit.getAnswers();
        for (Answer answer : answers) {
            if (answer.getType()==Answer.Type.CHOICE) {
                Answer_Choice answerChoice = (Answer_Choice) answer; 
                // if(answerChoice.isCorrect()){
                //     dem++;
                // }
                Map<Integer, Boolean> choices = answerChoice.getAnswer();

                for(int key : choices.keySet()){
                    boolean isCorrect = choices.get(key);
                    if(isCorrect==true){
                        dem++;
                    }
                }
            }

            else if (answer.getType()==Answer.Type.FILL) {
                Answer_Fill answerFill = (Answer_Fill) answer;
                if(answerFill.isCorrect()){
                    dem++;
                }
            }
        }
        return dem;
    }

    //calculate total number of requirements to answer
    public int calculateTotalRequirementToAnswer(Submit submit) {
        int total=0;
        List<Answer> answers = submit.getAnswers();
        for (Answer answer : answers) {
            total+=answer.getNumber_of_requiremient_to_answer();
        }
        return total;
    }

}






