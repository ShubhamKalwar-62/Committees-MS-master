package com.example.Service;

import com.example.Entity.Task;
import com.example.Entity.Committee;
import com.example.Entity.Users;
import com.example.Repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {
    
    @Autowired
    private TaskRepository taskRepository;
    
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }
    
    public Optional<Task> getTaskById(Integer id) {
        return taskRepository.findById(id);
    }
    
    public List<Task> getTasksByCommittee(Committee committee) {
        return taskRepository.findByCommittee(committee);
    }
    
    public List<Task> getTasksByCreatedBy(Users createdBy) {
        return taskRepository.findByCreatedBy(createdBy);
    }
    
    public List<Task> getTasksByAssignedTo(Users assignedTo) {
        return taskRepository.findByAssignedTo(assignedTo);
    }
    
    public List<Task> getTasksByStatus(Task.TaskStatus status) {
        return taskRepository.findByStatus(status);
    }
    
    public List<Task> getTasksByPriority(Task.TaskPriority priority) {
        return taskRepository.findByPriority(priority);
    }
    
    public List<Task> getOverdueTasks() {
        return taskRepository.findOverdueTasks(LocalDateTime.now());
    }
    
    public List<Task> getTasksByCommitteeId(Integer committeeId) {
        return taskRepository.findByCommitteeIdOrderByCreatedAt(committeeId);
    }
    
    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }
    
    public void deleteTask(Integer id) {
        taskRepository.deleteById(id);
    }
    
    public Task updateTask(Integer id, Task taskDetails) {
        Optional<Task> existingTask = taskRepository.findById(id);
        if (existingTask.isPresent()) {
            Task task = existingTask.get();
            task.setTitle(taskDetails.getTitle());
            task.setDescription(taskDetails.getDescription());
            task.setStatus(taskDetails.getStatus());
            task.setPriority(taskDetails.getPriority());
            task.setDueDate(taskDetails.getDueDate());
            task.setAssignedTo(taskDetails.getAssignedTo());
            return taskRepository.save(task);
        }
        return null;
    }
}