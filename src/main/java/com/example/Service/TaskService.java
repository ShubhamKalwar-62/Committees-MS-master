package com.example.Service;

import java.util.List;
import java.util.Optional;

import com.example.Entity.Committee;
import com.example.Entity.Task;
import com.example.Entity.Users;

public interface TaskService {
    List<Task> getAllTasks();
    Optional<Task> getTaskById(Integer id);
    List<Task> getTasksByCommittee(Committee committee);
    List<Task> getTasksByCreatedBy(Users createdBy);
    List<Task> getTasksByAssignedTo(Users assignedTo);
    List<Task> getTasksByAssignedUserId(Integer userId);
    List<Task> getTasksByStatus(Task.TaskStatus status);
    List<Task> getTasksByPriority(Task.TaskPriority priority);
    List<Task> getOverdueTasks();
    List<Task> getTasksByCommitteeId(Integer committeeId);
    Task saveTask(Task task);
    Task markTaskAsComplete(Integer id, String requesterEmail);
    void deleteTask(Integer id);
    Task updateTask(Integer id, Task taskDetails);
}