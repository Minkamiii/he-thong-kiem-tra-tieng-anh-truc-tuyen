package com.khanh.code.submit;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmitRepository extends JpaRepository<Submit, String> {
    
    @Query("SELECT s FROM Submit s WHERE s.id_user = ?1")
    List<Submit> findByUserId(String userId);

    @Query("SELECT s FROM Submit s WHERE s.id_test = ?1")
    List<Submit> findByTestId(String testId);

    //Page
    @Query("SELECT s FROM Submit s WHERE s.id_user = ?1 ORDER BY s.submit_day DESC")
    Page<Submit> findByUserIdOrderBySubmitDayDESC(String userId, Pageable pageable);

    @Query("SELECT s FROM Submit s WHERE s.id_user = ?1 AND s.type = ?2 ORDER BY s.submit_day DESC")
    Page<Submit> findByUserIdAndTypeOrderBySubmitDayDesc(String userId, Submit.Type type, Pageable pageable);

    @Query("SELECT s FROM Submit s WHERE s.id_user = ?1 AND s.id_test = ?2 ORDER BY s.submit_day DESC")
    Page<Submit> findByUserIdAndTestIdOrderBySubmitDayDESC(String userId, String testId, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT s.id_user) FROM Submit s WHERE s.id_test = ?1")
    int countDistinctUsersByTestId(String testId);

    // Highest, lowest of a test for a specific user
    @Query("SELECT MAX(s.number_of_correct) FROM Submit_Listening s WHERE s.id_test = ?1 AND s.id_user = ?2")
    Integer findMaxListeningCorrect(String testID, String userID);

    @Query("SELECT MIN(s.number_of_correct) FROM Submit_Listening s WHERE s.id_test = ?1 AND s.id_user = ?2")
    Integer findMinListeningCorrect(String testID, String userID);

    @Query("SELECT MAX(s.number_of_correct) FROM Submit_Reading s WHERE s.id_test = ?1 AND s.id_user = ?2")
    Integer findMaxReadingCorrect(String testID, String userID);

    @Query("SELECT MIN(s.number_of_correct) FROM Submit_Reading s WHERE s.id_test = ?1 AND s.id_user = ?2")
    Integer findMinReadingCorrect(String testID, String userID);


    // Highest, lowest of a test (for admin — all users)
    @Query("SELECT MAX(s.number_of_correct) FROM Submit_Listening s WHERE s.id_test = ?1")
    Integer findMaxListeningCorrectOfTest(String testID);

    @Query("SELECT MIN(s.number_of_correct) FROM Submit_Listening s WHERE s.id_test = ?1")
    Integer findMinListeningCorrectOfTest(String testID);

    @Query("SELECT MAX(s.number_of_correct) FROM Submit_Reading s WHERE s.id_test = ?1")
    Integer findMaxReadingCorrectOfTest(String testID);

    @Query("SELECT MIN(s.number_of_correct) FROM Submit_Reading s WHERE s.id_test = ?1")
    Integer findMinReadingCorrectOfTest(String testID);


    //for unit test
    @Query("SELECT s FROM Submit_Listening s WHERE s.id = ?1")
    Submit_Listening findListeningById(String id);

    @Query("SELECT s FROM Submit_Reading s WHERE s.id = ?1")
    Submit_Reading findReadingById(String id);

    @Query("SELECT s FROM Submit_Writing s WHERE s.id = ?1")
    Submit_Writing findWritingById(String id);

    @Query("SELECT s FROM Submit s ORDER BY s.submit_day DESC")
    List<Submit> findAllOrderDayDESC();

    // @Query(value = "SELECT FLOOR(AVG(s.number_of_correct)) FROM submit_listening s WHERE s.id_test = ?1 AND s.id_user = ?2",nativeQuery = true)
    // int findAvgListeningCorrect(String testID, String userID);

    // @Query(value = "SELECT FLOOR(AVG(s.number_of_correct)) FROM submit_reading s WHERE s.id_test = ?1 AND s.id_user = ?2",nativeQuery = true)
    // int findAvgReadingCorrect(String testID, String userID);

    // @Query(value = "SELECT FLOOR(AVG(s.number_of_correct)) FROM submit_listening s WHERE s.id_test = ?1 AND s.id_user = ?2",nativeQuery = true)
    // int findAvgListeningCorrectOfttest(String testID);

    // @Query(value = "SELECT FLOOR(AVG(s.number_of_correct)) FROM submit_reading s WHERE s.id_test = ?1 AND s.id_user = ?2",nativeQuery = true)
    // int findAvgReadingCorrectOfttest(String testID);
    
    // @Query("SELECT DISTINCT s.id_test FROM Submit s WHERE s.id_user = ?1")
    // List<String> findDistinctIdTestByUserId(String userId);

    // @Query("SELECT s FROM Submit s WHERE s.id_user = ?1 ORDER BY s.submit_day DESC")
    // List<Submit> findByUserIdOrderBySubmitDayDESC(String userId);

    // @Query("SELECT s FROM Submit_Writing s WHERE s.id_user = ?1")
    // List<Submit_Writing> findWritingSubmissionsByUserId(String userId);

    // @Query("SELECT s FROM Submit_Reading s WHERE s.id_user = ?1")
    // List<Submit_Reading> findReadingSubmissionsByUserId(String userId);

    // @Query("SELECT s FROM Submit_Listening s WHERE s.id_user = ?1")
    // List<Submit_Listening> findListeningSubmissionsByUserId(String userId);

    // @Query("SELECT s FROM Submit s WHERE s.id_user = ?1 AND s.id_test = ?2 ORDER BY s.submit_day DESC")
    // List<Submit> findByUserIdAndTestIdBySubmitDayDESC(String userId, String testId);

}
    
