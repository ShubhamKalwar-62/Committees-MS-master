package com.example.Controller;

import com.example.Entity.CommitteeChat;
import com.example.Response.ResponceBean;
import com.example.Service.CommitteeChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/committee-chat")
@Tag(name = "Committee Chat Management", description = "APIs for managing committee chat and messaging")
public class CommitteeChatController {
    
    @Autowired
    private CommitteeChatService committeeChatService;
    
    @GetMapping
    @Operation(summary = "Get all chat messages", description = "Retrieve all committee chat messages")
    public ResponseEntity<ResponceBean<List<CommitteeChat>>> getAllChatMessages() {
        List<CommitteeChat> messages = committeeChatService.getAllChatMessages();
        return ResponseEntity.ok(ResponceBean.success("Chat messages retrieved successfully", messages));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get chat message by ID", description = "Retrieve specific chat message by ID")
    public ResponseEntity<ResponceBean<CommitteeChat>> getChatMessageById(@PathVariable Integer id) {
        Optional<CommitteeChat> message = committeeChatService.getChatMessageById(id);
        if (message.isPresent()) {
            return ResponseEntity.ok(ResponceBean.success("Chat message retrieved successfully", message.get()));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Chat message not found"));
    }
    
    @GetMapping("/committee/{committeeId}")
    @Operation(summary = "Get messages by committee", description = "Retrieve chat messages by committee ID")
    public ResponseEntity<ResponceBean<List<CommitteeChat>>> getChatMessagesByCommittee(@PathVariable Integer committeeId) {
        List<CommitteeChat> messages = committeeChatService.getChatMessagesByCommitteeId(committeeId);
        return ResponseEntity.ok(ResponceBean.success("Chat messages retrieved successfully", messages));
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get messages by user", description = "Retrieve chat messages by user ID")
    public ResponseEntity<ResponceBean<List<CommitteeChat>>> getChatMessagesByUser(@PathVariable Integer userId) {
        List<CommitteeChat> messages = committeeChatService.getChatMessagesByUserId(userId);
        return ResponseEntity.ok(ResponceBean.success("Chat messages retrieved successfully", messages));
    }
    
    @GetMapping("/committee/{committeeId}/date-range")
    @Operation(summary = "Get messages by date range", description = "Retrieve chat messages by committee and date range")
    public ResponseEntity<ResponceBean<List<CommitteeChat>>> getChatMessagesByDateRange(
            @PathVariable Integer committeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTime) {
        List<CommitteeChat> messages = committeeChatService.getChatMessagesByCommitteeAndDateRange(committeeId, startTime, endTime);
        return ResponseEntity.ok(ResponceBean.success("Chat messages retrieved successfully", messages));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search messages by keyword", description = "Search chat messages by keyword in message content")
    public ResponseEntity<ResponceBean<List<CommitteeChat>>> searchChatMessages(@RequestParam String keyword) {
        List<CommitteeChat> messages = committeeChatService.searchChatMessagesByKeyword(keyword);
        return ResponseEntity.ok(ResponceBean.success("Chat messages found", messages));
    }
    
    @PostMapping
    @Operation(summary = "Send chat message", description = "Send a new chat message to committee")
    public ResponseEntity<ResponceBean<CommitteeChat>> sendChatMessage(@RequestBody CommitteeChat chatMessage) {
        CommitteeChat savedMessage = committeeChatService.saveChatMessage(chatMessage);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponceBean.success("Chat message sent successfully", savedMessage));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update chat message", description = "Update existing chat message")
    public ResponseEntity<ResponceBean<CommitteeChat>> updateChatMessage(@PathVariable Integer id, @RequestBody CommitteeChat chatMessageDetails) {
        CommitteeChat updatedMessage = committeeChatService.updateChatMessage(id, chatMessageDetails);
        if (updatedMessage != null) {
            return ResponseEntity.ok(ResponceBean.success("Chat message updated successfully", updatedMessage));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Chat message not found"));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete chat message", description = "Delete chat message")
    public ResponseEntity<ResponceBean<String>> deleteChatMessage(@PathVariable Integer id) {
        Optional<CommitteeChat> message = committeeChatService.getChatMessageById(id);
        if (message.isPresent()) {
            committeeChatService.deleteChatMessage(id);
            return ResponseEntity.ok(ResponceBean.success("Chat message deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ResponceBean.error("Chat message not found"));
    }
}