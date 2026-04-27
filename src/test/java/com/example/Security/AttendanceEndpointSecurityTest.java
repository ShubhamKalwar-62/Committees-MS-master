package com.example.Security;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.Entity.Attendance;
import com.example.Entity.Login;
import com.example.Entity.Users;
import com.example.Repository.UsersRepository;
import com.example.Service.AttendanceService;

@SpringBootTest
@AutoConfigureMockMvc
class AttendanceEndpointSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AttendanceService attendanceService;

    @MockitoBean
    private UsersRepository usersRepository;

    @BeforeEach
    void setUp() {
        when(attendanceService.getAttendanceByFilters(any(), any(), any(), any())).thenReturn(List.of());
        when(usersRepository.findByEmail("student@test.local")).thenReturn(Optional.of(buildUser(72, "STUDENT")));
        when(usersRepository.findByEmail("faculty@test.local")).thenReturn(Optional.of(buildUser(44, "FACULTY")));
    }

    @Test
    @WithMockUser(username = "student@test.local", roles = { "STUDENT" })
    void getAttendance_whenStudentRequestsOtherUser_thenForbidden() throws Exception {
        mockMvc.perform(get("/api/attendance").param("userId", "99"))
            .andExpect(status().isForbidden());

        verify(attendanceService, never()).getAttendanceByFilters(any(), any(), any(), any());
    }

    @Test
    @WithMockUser(username = "student@test.local", roles = { "STUDENT" })
    void getAttendance_whenStudentOmitsUserId_thenScopedToSelf() throws Exception {
        mockMvc.perform(get("/api/attendance"))
            .andExpect(status().isOk());

        verify(attendanceService).getAttendanceByFilters(isNull(), eq(72), isNull(), isNull());
    }

    @Test
    @WithMockUser(username = "student@test.local", roles = { "STUDENT" })
    void getAttendance_whenStudentRequestsOwnUserId_thenOk() throws Exception {
        mockMvc.perform(get("/api/attendance").param("userId", "72"))
            .andExpect(status().isOk());

        verify(attendanceService).getAttendanceByFilters(isNull(), eq(72), isNull(), isNull());
    }

    @Test
    @WithMockUser(username = "faculty@test.local", roles = { "FACULTY" })
    void getAttendance_whenFacultyRequestsUser_thenOk() throws Exception {
        mockMvc.perform(get("/api/attendance").param("userId", "99"))
            .andExpect(status().isOk());

        verify(attendanceService).getAttendanceByFilters(isNull(), eq(99), isNull(), isNull());
    }

    private Users buildUser(int userId, String role) {
        Login login = new Login();
        login.setEmail(role.toLowerCase() + "@test.local");
        login.setRole(role);

        Users user = new Users();
        user.setUserId(userId);
        user.setName(role + " User");
        user.setLogin(login);
        return user;
    }
}
