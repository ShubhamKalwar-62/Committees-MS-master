package com.example.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.Committee;
import com.example.Entity.Task;
import com.example.Entity.Users;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.TaskRepository;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    public Optional<Task> getTaskById(Integer id) {
        return taskRepository.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public List<Task> getTasksByCommittee(Committee committee) {
        return taskRepository.findByCommittee(committee);
    }

    @Override
    public List<Task> getTasksByCreatedBy(Users createdBy) {
        return taskRepository.findByCreatedBy(createdBy);
    }

    @Override
    public List<Task> getTasksByAssignedTo(Users assignedTo) {
        return taskRepository.findByAssignedTo(assignedTo);
    }

    @Override
    public List<Task> getTasksByStatus(Task.TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    @Override
    public List<Task> getTasksByPriority(Task.TaskPriority priority) {
        return taskRepository.findByPriority(priority);
    }

    @Override
    public List<Task> getOverdueTasks() {
        return taskRepository.findOverdueTasks(LocalDateTime.now());
    }

    @Override
    public List<Task> getTasksByCommitteeId(Integer committeeId) {
        return taskRepository.findByCommitteeIdOrderByCreatedAt(committeeId);
    }

    @Override
    public Task saveTask(Task task) {
        return taskRepository.save(Objects.requireNonNull(task, "task must not be null"));
    }

    @Override
    public void deleteTask(Integer id) {
        taskRepository.deleteById(Objects.requireNonNull(id, "id must not be null"));
    }

    @Override
    public Task updateTask(Integer id, Task taskDetails) {
        Optional<Task> existingTask = taskRepository.findById(Objects.requireNonNull(id, "id must not be null"));
        if (existingTask.isPresent()) {
            Task task = existingTask.get();
            task.setTitle(taskDetails.getTitle());
            task.setDescription(taskDetails.getDescription());
            task.setStatus(taskDetails.getStatus());
            task.setPriority(taskDetails.getPriority());
            task.setStartDate(taskDetails.getStartDate());
            task.setEndDate(taskDetails.getEndDate());
            task.setAssignedTo(taskDetails.getAssignedTo());
            return taskRepository.save(task);
        }
        throw new ResourceNotFoundException("Task not found with id: " + id);
    }
}
