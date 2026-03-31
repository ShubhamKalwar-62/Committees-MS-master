package com.example.Service;

import com.example.Entity.CommitteeChat;
import com.example.Entity.Committee;
import com.example.Entity.Users;
import com.example.Repository.CommitteeChatRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommitteeChatService {
    
    @Autowired
    private CommitteeChatRepository committeeChatRepository;
    
    public List<CommitteeChat> getAllChatMessages() {
        return committeeChatRepository.findAll();
    }
    
    public Optional<CommitteeChat> getChatMessageById(Integer id) {
        return committeeChatRepository.findById(id);
    }
    
    public List<CommitteeChat> getChatMessagesByCommittee(Committee committee) {
        return committeeChatRepository.findByCommittee(committee);
    }
    
    public List<CommitteeChat> getChatMessagesByUser(Users user) {
        return committeeChatRepository.findByUser(user);
    }
    
    public List<CommitteeChat> getChatMessagesByCommitteeId(Integer committeeId) {
        return committeeChatRepository.findByCommitteeIdOrderBySentAt(committeeId);
    }
    
    public List<CommitteeChat> getChatMessagesByUserId(Integer userId) {
        return committeeChatRepository.findByUserIdOrderBySentAt(userId);
    }
    
    public List<CommitteeChat> getChatMessagesByCommitteeAndDateRange(Integer committeeId, LocalDateTime startTime, LocalDateTime endTime) {
        return committeeChatRepository.findByCommitteeIdAndSentAtBetween(committeeId, startTime, endTime);
    }
    
    public List<CommitteeChat> searchChatMessagesByKeyword(String keyword) {
        return committeeChatRepository.findByMessageContaining(keyword);
    }
    
    public CommitteeChat saveChatMessage(CommitteeChat chatMessage) {
        return committeeChatRepository.save(chatMessage);
    }
    
    public void deleteChatMessage(Integer id) {
        committeeChatRepository.deleteById(id);
    }
    
    public CommitteeChat updateChatMessage(Integer id, CommitteeChat chatMessageDetails) {
        Optional<CommitteeChat> existingChatMessage = committeeChatRepository.findById(id);
        if (existingChatMessage.isPresent()) {
            CommitteeChat chatMessage = existingChatMessage.get();
            chatMessage.setMessage(chatMessageDetails.getMessage());
            return committeeChatRepository.save(chatMessage);
        }
        return null;
    }
}