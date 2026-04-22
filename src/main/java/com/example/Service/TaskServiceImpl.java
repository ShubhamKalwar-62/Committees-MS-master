package com.example.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.example.Entity.Committee;
import com.example.Entity.Task;
import com.example.Entity.Users;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.CommitteeRepository;
import com.example.Repository.TaskRepository;
import com.example.Repository.UsersRepository;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Autowired
    private CommitteeRepository committeeRepository;

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
    public List<Task> getTasksByAssignedUserId(Integer userId) {
        return taskRepository.findByAssignedToUserIdOrderByCreatedAtDesc(Objects.requireNonNull(userId, "userId must not be null"));
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
        return taskRepository.findByCommitteeIdOrderByCreatedAt(Objects.requireNonNull(committeeId, "committeeId must not be null"));
    }

    @Override
    public Task saveTask(Task task) {
        Task nonNullTask = Objects.requireNonNull(task, "task must not be null");
        validateAndNormalizeTask(nonNullTask);
        return taskRepository.save(nonNullTask);
    }

    @Override
    public Task markTaskAsComplete(Integer id, String requesterEmail) {
        Task task = taskRepository.findById(Objects.requireNonNull(id, "id must not be null"))
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        String nonBlankRequesterEmail = Objects.requireNonNull(requesterEmail, "requesterEmail must not be null").trim();
        if (nonBlankRequesterEmail.isEmpty()) {
            throw new IllegalArgumentException("requester email is required");
        }

        Users requester = usersRepository.findByEmail(nonBlankRequesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + nonBlankRequesterEmail));

        if (!canUserMarkTaskComplete(task, requester)) {
            throw new AccessDeniedException("You are not allowed to complete this task");
        }

        if (!Task.TaskStatus.COMPLETED.equals(task.getStatus())) {
            task.setStatus(Task.TaskStatus.COMPLETED);
        }

        return taskRepository.save(task);
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
            validateAndNormalizeTask(task);
            return taskRepository.save(task);
        }
        throw new ResourceNotFoundException("Task not found with id: " + id);
    }

    private void validateAndNormalizeTask(Task task) {
        String normalizedTitle = Optional.ofNullable(task.getTitle())
                .map(String::trim)
                .orElse("");
        if (normalizedTitle.isEmpty()) {
            throw new IllegalArgumentException("title is required");
        }
        task.setTitle(normalizedTitle);

        if (task.getStartDate() != null && task.getEndDate() != null && task.getEndDate().isBefore(task.getStartDate())) {
            throw new IllegalArgumentException("endDate must be after startDate");
        }

        if (task.getStatus() == null) {
            task.setStatus(Task.TaskStatus.PENDING);
        }

        if (task.getPriority() == null) {
            task.setPriority(Task.TaskPriority.MEDIUM);
        }

        Committee committeeRef = task.getCommittee();
        Integer committeeId = committeeRef != null ? committeeRef.getCommitteeId() : null;
        if (committeeId == null || committeeId <= 0) {
            throw new IllegalArgumentException("committeeId is required");
        }
        Committee committee = committeeRepository.findById(committeeId)
                .orElseThrow(() -> new IllegalArgumentException("committee not found with id: " + committeeId));
        task.setCommittee(committee);

        Users createdByRef = task.getCreatedBy();
        Integer createdById = createdByRef != null ? createdByRef.getUserId() : null;
        if (createdById == null || createdById <= 0) {
            throw new IllegalArgumentException("createdBy userId is required");
        }
        Users createdBy = usersRepository.findById(createdById)
                .orElseThrow(() -> new IllegalArgumentException("createdBy user not found with id: " + createdById));
        task.setCreatedBy(createdBy);

        if (task.getAssignedTo() == null) {
            return;
        }

        Integer assignedToId = task.getAssignedTo().getUserId();
        if (assignedToId == null || assignedToId <= 0) {
            throw new IllegalArgumentException("assignedTo userId must be a positive integer");
        }

        Users assignedTo = usersRepository.findById(assignedToId)
                .orElseThrow(() -> new IllegalArgumentException("assignedTo user not found with id: " + assignedToId));

        String normalizedAssignedRole = normalizeRole(assignedTo.getLogin() != null ? assignedTo.getLogin().getRole() : null);
        if (!"FACULTY".equals(normalizedAssignedRole) && !"STUDENT".equals(normalizedAssignedRole)) {
            throw new IllegalArgumentException("assignedTo user must have FACULTY or STUDENT role");
        }

        task.setAssignedTo(assignedTo);
    }

    private boolean canUserMarkTaskComplete(Task task, Users requester) {
        Integer requesterUserId = requester.getUserId();
        String normalizedRole = normalizeRole(requester.getLogin() != null ? requester.getLogin().getRole() : null);
        if ("ADMIN".equals(normalizedRole) || "FACULTY".equals(normalizedRole)) {
            return true;
        }

        Integer assignedToUserId = task.getAssignedTo() != null ? task.getAssignedTo().getUserId() : null;
        if (requesterUserId != null && requesterUserId.equals(assignedToUserId)) {
            return true;
        }

        Integer createdByUserId = task.getCreatedBy() != null ? task.getCreatedBy().getUserId() : null;
        return requesterUserId != null && requesterUserId.equals(createdByUserId);
    }

    private String normalizeRole(String role) {
        if (role == null) {
            return "";
        }

        String normalized = role.trim().toUpperCase();
        if (normalized.startsWith("ROLE_")) {
            return normalized.substring(5);
        }

        return normalized;
    }
}
