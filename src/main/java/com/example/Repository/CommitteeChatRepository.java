package com.example.Repository;

import com.example.Entity.CommitteeChat;
import com.example.Entity.Committee;
import com.example.Entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommitteeChatRepository extends JpaRepository<CommitteeChat, Integer> {
    
    List<CommitteeChat> findByCommittee(Committee committee);
    
    List<CommitteeChat> findByUser(Users user);
    
    @Query("SELECT cc FROM CommitteeChat cc WHERE cc.committee.committeeId = :committeeId ORDER BY cc.sentAt ASC")
    List<CommitteeChat> findByCommitteeIdOrderBySentAt(@Param("committeeId") Integer committeeId);
    
    @Query("SELECT cc FROM CommitteeChat cc WHERE cc.user.userId = :userId ORDER BY cc.sentAt DESC")
    List<CommitteeChat> findByUserIdOrderBySentAt(@Param("userId") Integer userId);
    
    @Query("SELECT cc FROM CommitteeChat cc WHERE cc.committee.committeeId = :committeeId AND cc.sentAt BETWEEN :startTime AND :endTime")
    List<CommitteeChat> findByCommitteeIdAndSentAtBetween(@Param("committeeId") Integer committeeId, 
                                                         @Param("startTime") LocalDateTime startTime, 
                                                         @Param("endTime") LocalDateTime endTime);
    
    @Query("SELECT cc FROM CommitteeChat cc WHERE cc.message LIKE %:keyword%")
    List<CommitteeChat> findByMessageContaining(@Param("keyword") String keyword);
}