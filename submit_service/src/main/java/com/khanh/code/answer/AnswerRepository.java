package com.khanh.code.answer;

import org.springframework.stereotype.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, String> {


    @Query("SELECT a FROM Answer a WHERE a.id_question = ?1")
    List<Answer> findByQuestionId(String questionId);
    
    @Query("SELECT a FROM Answer_Essay a WHERE a.id_question = ?1")
    List<Answer_Essay> findEssayAnswersByQuestionId(String questionId);

    @Query("SELECT a from Answer_Choice a WHERE a.id_question = ?1")
    List<Answer_Choice> findChoiceAnswersByQuestionId(String questionId);

    @Query("SELECT a FROM Answer_Fill a WHERE a.id_question = ?1")
    List<Answer_Fill> findFillAnswersByQuestionId(String id_question);

    
    @Query("SELECT a FROM Answer a WHERE a.submit.id = ?1")
    List<Answer> findBySubmitId(String submitId);

    @Query("SELECT a FROM Answer_Essay a WHERE a.submit.id = ?1")
    List<Answer_Essay> findEssayAnswersBySubmitId(String submitId);

    @Query("SELECT a FROM Answer_Choice a WHERE a.submit.id = ?1")
    List<Answer_Choice> findChoiceAnswersBySubmitId(String submitId);
    
    @Query("SELECT a FROM Answer_Fill a WHERE a.submit.id = ?1")
    List<Answer_Fill> findFillAnswersBySubmitId(String submitId);

    //Check gui 2 lan 1 mot cau hoi trong cung 1 de thi
    @Query("SELECT a from Answer a where a.submit.id = ?1 and a.id_question = ?2")
    Answer findBySubmitIdAndQuestionId(String submitId, String questionId);
}
