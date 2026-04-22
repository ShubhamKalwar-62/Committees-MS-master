package com.example.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.example.Entity.Committee;
import com.example.Entity.Login;
import com.example.Entity.Task;
import com.example.Entity.Users;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.CommitteeRepository;
import com.example.Repository.TaskRepository;
import com.example.Repository.UsersRepository;

@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class TaskServiceImplAuthorizationTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private CommitteeRepository committeeRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    @Test
    void markTaskAsComplete_whenRequesterIsAdmin_thenCompletes() {
        Task task = buildExistingTask(11, 2, 3, Task.TaskStatus.PENDING);
        Users admin = buildUser(1, "admin@test.local", "ADMIN");

        when(taskRepository.findById(11)).thenReturn(Optional.of(task));
        when(usersRepository.findByEmail("admin@test.local")).thenReturn(Optional.of(admin));
        when(taskRepository.save(task)).thenReturn(task);

        Task updated = taskService.markTaskAsComplete(11, "admin@test.local");

        assertEquals(Task.TaskStatus.COMPLETED, updated.getStatus());
        verify(taskRepository).save(task);
    }

    @Test
    void markTaskAsComplete_whenRequesterIsFaculty_thenCompletes() {
        Task task = buildExistingTask(12, 2, 3, Task.TaskStatus.IN_PROGRESS);
        Users faculty = buildUser(4, "faculty@test.local", "FACULTY");

        when(taskRepository.findById(12)).thenReturn(Optional.of(task));
        when(usersRepository.findByEmail("faculty@test.local")).thenReturn(Optional.of(faculty));
        when(taskRepository.save(task)).thenReturn(task);

        Task updated = taskService.markTaskAsComplete(12, "faculty@test.local");

        assertEquals(Task.TaskStatus.COMPLETED, updated.getStatus());
        verify(taskRepository).save(task);
    }

    @Test
    void markTaskAsComplete_whenRequesterIsAssignee_thenCompletes() {
        Task task = buildExistingTask(13, 2, 7, Task.TaskStatus.PENDING);
        Users assignee = buildUser(7, "assignee@test.local", "STUDENT");

        when(taskRepository.findById(13)).thenReturn(Optional.of(task));
        when(usersRepository.findByEmail("assignee@test.local")).thenReturn(Optional.of(assignee));
        when(taskRepository.save(task)).thenReturn(task);

        Task updated = taskService.markTaskAsComplete(13, "assignee@test.local");

        assertEquals(Task.TaskStatus.COMPLETED, updated.getStatus());
        verify(taskRepository).save(task);
    }

    @Test
    void markTaskAsComplete_whenRequesterIsCreator_thenCompletes() {
        Task task = buildExistingTask(14, 8, 9, Task.TaskStatus.PENDING);
        Users creator = buildUser(8, "creator@test.local", "STUDENT");

        when(taskRepository.findById(14)).thenReturn(Optional.of(task));
        when(usersRepository.findByEmail("creator@test.local")).thenReturn(Optional.of(creator));
        when(taskRepository.save(task)).thenReturn(task);

        Task updated = taskService.markTaskAsComplete(14, "creator@test.local");

        assertEquals(Task.TaskStatus.COMPLETED, updated.getStatus());
        verify(taskRepository).save(task);
    }

    @Test
    void markTaskAsComplete_whenRequesterIsUnrelatedStudent_thenAccessDenied() {
        Task task = buildExistingTask(15, 3, 4, Task.TaskStatus.PENDING);
        Users unrelatedStudent = buildUser(99, "student@test.local", "STUDENT");

        when(taskRepository.findById(15)).thenReturn(Optional.of(task));
        when(usersRepository.findByEmail("student@test.local")).thenReturn(Optional.of(unrelatedStudent));

        AccessDeniedException exception = assertThrows(
            AccessDeniedException.class,
            () -> taskService.markTaskAsComplete(15, "student@test.local")
        );
        assertTrue(exception.getMessage().contains("You are not allowed"));
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void markTaskAsComplete_whenRequesterEmailNotFound_thenNotFound() {
        Task task = buildExistingTask(16, 3, 4, Task.TaskStatus.PENDING);

        when(taskRepository.findById(16)).thenReturn(Optional.of(task));
        when(usersRepository.findByEmail("missing@test.local")).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
            ResourceNotFoundException.class,
            () -> taskService.markTaskAsComplete(16, "missing@test.local")
        );
        assertTrue(exception.getMessage().contains("User not found"));
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void saveTask_whenAssigneeRoleIsAdmin_thenRejects() {
        Task newTask = buildNewTaskForSave(100, 200, 300);
        Committee committee = new Committee();
        committee.setCommitteeId(100);
        committee.setCommitteeName("Quality Committee");

        Users createdBy = buildUser(200, "creator@test.local", "FACULTY");
        Users adminAssignee = buildUser(300, "admin-assignee@test.local", "ROLE_ADMIN");

        when(committeeRepository.findById(100)).thenReturn(Optional.of(committee));
        when(usersRepository.findById(200)).thenReturn(Optional.of(createdBy));
        when(usersRepository.findById(300)).thenReturn(Optional.of(adminAssignee));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> taskService.saveTask(newTask));

        assertTrue(ex.getMessage().contains("FACULTY or STUDENT"));
        verify(taskRepository, never()).save(any(Task.class));
    }

    @Test
    void saveTask_whenAssigneeRoleIsRolePrefixedStudent_thenSavesAndDefaults() {
        Task newTask = buildNewTaskForSave(100, 200, 300);
        Committee committee = new Committee();
        committee.setCommitteeId(100);
        committee.setCommitteeName("Quality Committee");

        Users createdBy = buildUser(200, "creator@test.local", "FACULTY");
        Users studentAssignee = buildUser(300, "student@test.local", "ROLE_STUDENT");

        when(committeeRepository.findById(100)).thenReturn(Optional.of(committee));
        when(usersRepository.findById(200)).thenReturn(Optional.of(createdBy));
        when(usersRepository.findById(300)).thenReturn(Optional.of(studentAssignee));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Task saved = taskService.saveTask(newTask);

        assertEquals("Demo Task", saved.getTitle());
        assertEquals(Task.TaskStatus.PENDING, saved.getStatus());
        assertEquals(Task.TaskPriority.MEDIUM, saved.getPriority());
        assertSame(committee, saved.getCommittee());
        assertSame(createdBy, saved.getCreatedBy());
        assertSame(studentAssignee, saved.getAssignedTo());
    }

    @Test
    void getTasksByAssignedUserId_whenUserExists_thenReturnsRepositoryResult() {
        Task task = buildExistingTask(20, 1, 77, Task.TaskStatus.PENDING);
        when(taskRepository.findByAssignedToUserIdOrderByCreatedAtDesc(77)).thenReturn(List.of(task));

        List<Task> tasks = taskService.getTasksByAssignedUserId(77);

        assertEquals(1, tasks.size());
        assertEquals(20, tasks.get(0).getTaskId());
    }

    private Task buildExistingTask(Integer taskId, Integer createdById, Integer assignedToId, Task.TaskStatus status) {
        Task task = new Task();
        task.setTaskId(taskId);
        task.setTitle("Existing Task");
        task.setDescription("Task description");
        task.setStatus(status);
        task.setPriority(Task.TaskPriority.MEDIUM);
        task.setStartDate(LocalDateTime.now().minusDays(1));
        task.setEndDate(LocalDateTime.now().plusDays(1));

        Committee committee = new Committee();
        committee.setCommitteeId(10);
        committee.setCommitteeName("Core Committee");
        task.setCommittee(committee);

        Users createdBy = buildUser(createdById, "creator" + createdById + "@test.local", "STUDENT");
        task.setCreatedBy(createdBy);

        if (assignedToId != null) {
            Users assignedTo = buildUser(assignedToId, "assignee" + assignedToId + "@test.local", "STUDENT");
            task.setAssignedTo(assignedTo);
        }

        return task;
    }

    private Task buildNewTaskForSave(Integer committeeId, Integer createdById, Integer assignedToId) {
        Task task = new Task();
        task.setTitle("  Demo Task  ");
        task.setDescription("Create an actionable task");
        task.setStartDate(LocalDateTime.now().plusHours(1));
        task.setEndDate(LocalDateTime.now().plusDays(2));
        task.setStatus(null);
        task.setPriority(null);

        Committee committeeRef = new Committee();
        committeeRef.setCommitteeId(committeeId);
        task.setCommittee(committeeRef);

        Users createdByRef = new Users();
        createdByRef.setUserId(createdById);
        task.setCreatedBy(createdByRef);

        Users assignedToRef = new Users();
        assignedToRef.setUserId(assignedToId);
        task.setAssignedTo(assignedToRef);

        return task;
    }

    private Users buildUser(Integer userId, String email, String role) {
        Login login = new Login();
        login.setEmail(email);
        login.setRole(role);

        Users user = new Users();
        user.setUserId(userId);
        user.setName("User " + userId);
        user.setLogin(login);
        return user;
    }
}
