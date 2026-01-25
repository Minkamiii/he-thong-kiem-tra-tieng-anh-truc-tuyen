package com.khanh.code.answer;

import org.springframework.stereotype.Repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, String> {

    @Query("SELECT a FROM Answer a WHERE a.id_question = ?1")
    List<Answer> findByQuestionId(String questionId);
    
    @Query("SELECT a from Answer_Choice a WHERE a.id_question = ?1")
    List<Answer_Choice> findChoiceAnswersByQuestionId(String questionId);

    @Query("SELECT a FROM Answer_Fill a WHERE a.id_question = ?1")
    List<Answer_Fill> findFillAnswersByQuestionId(String id_question);

    @Query("SELECT a FROM Answer a WHERE a.submit.id = ?1")
    List<Answer> findBySubmitId(String submitId);

    @Query("SELECT a from Answer a where a.submit.id = ?1 and a.id_question = ?2")
    Answer findBySubmitIdAndQuestionId(String submitId, String questionId);

    //100% wrong answers

    @Query(value = """
        SELECT a.id_question
        FROM answer_fill af
        JOIN answer a ON a.id = af.id
        JOIN submit s ON a.submit_id = s.id
        WHERE s.id_test = ?1 AND a.type = 'FILL'
        GROUP BY a.id_question
        HAVING MAX(af.correct) = 0
        """, nativeQuery = true)
    List<String> findAllQuestionsAllWrong_Fill(String testId);

    @Query(value = """
        SELECT DISTINCT a.id_question 
        FROM answer a 
        JOIN submit s ON a.submit_id = s.id 
        WHERE s.id_test = ?1 AND a.type = 'CHOICE'
        AND a.id_question NOT IN (
            SELECT a2.id_question 
            FROM answer_choices c 
            JOIN answer a2 ON c.answer_id = a2.id 
            WHERE a2.type = 'CHOICE' AND c.correct = true
            GROUP BY c.answer_id, a2.id_question
            HAVING SUM(c.correct) >= MAX(a2.number_of_requiremient_to_answer)
        )
        """, nativeQuery = true)
    List<String> findAllQuestionsAllWrong_Choice(String testId);


    // @Query("SELECT a FROM Answer_Essay a WHERE a.submit.id = ?1")
    // List<Answer_Essay> findEssayAnswersBySubmitId(String submitId);

    // @Query("SELECT a FROM Answer_Choice a WHERE a.submit.id = ?1")
    // List<Answer_Choice> findChoiceAnswersBySubmitId(String submitId);
    
    // @Query("SELECT a FROM Answer_Fill a WHERE a.submit.id = ?1")
    // List<Answer_Fill> findFillAnswersBySubmitId(String submitId);

    // @Query("SELECT a FROM Answer_Essay a WHERE a.id_question = ?1")
    // List<Answer_Essay> findEssayAnswersByQuestionId(String questionId);
}
