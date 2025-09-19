package com.khanh.code.submit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SubmitRepository extends JpaRepository<Submit, String> {
    @Query("SELECT s FROM Submit s WHERE s.id_user = ?1 AND s.id_test = ?2")
    List<Submit> findByUserIdAndTestId(String userId, String testId);

    @Query("SELECT s FROM Submit s WHERE s.id_user = ?1")
    List<Submit> findByUserId(String userId);

    @Query("SELECT s FROM Submit s WHERE s.id_user = ?1 ORDER BY s.submit_day DESC")
    List<Submit> findByUserIdOrderBySubmitDayDESC(String userId);  
    
    @Query("SELECT s FROM Submit s WHERE s.id_user = ?1 AND s.id_test = ?2 ORDER BY s.submit_day DESC")
    List<Submit> findByUserIdAndTestIdBySubmitDayDESC(String userId, String testId);

    @Query("SELECT s FROM Submit s WHERE s.id_test = ?1")
    List<Submit> findByTestId(String testId);

    @Query("SELECT s FROM Submit_Writing s WHERE s.id_user = ?1")
    List<Submit_Writing> findWritingSubmissionsByUserId(String userId);

    @Query("SELECT s FROM Submit_Reading s WHERE s.id_user = ?1")
    List<Submit_Reading> findReadingSubmissionsByUserId(String userId);

    @Query("SELECT s FROM Submit_Listening s WHERE s.id_user = ?1")
    List<Submit_Listening> findListeningSubmissionsByUserId(String userId);

    @Query("SELECT s FROM Submit_Listening s WHERE s.id = ?1")
    Submit_Listening findListeningById(String id);

    @Query("SELECT s FROM Submit_Reading s WHERE s.id = ?1")
    Submit_Reading findReadingById(String id);

    @Query("SELECT s FROM Submit_Writing s WHERE s.id = ?1")
    Submit_Writing findWritingById(String id);

    @Query("SELECT s FROM Submit s ORDER BY s.submit_day DESC")
    List<Submit> findAllOrderDayDESC(); 
    

}
    
