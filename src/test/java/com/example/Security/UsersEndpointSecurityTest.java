package com.example.Security;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.Service.UsersService;

@SpringBootTest
@AutoConfigureMockMvc
class UsersEndpointSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UsersService usersService;

    @BeforeEach
    void setUp() {
        when(usersService.getAllUsers()).thenReturn(List.of());
    }

    @Test
    @WithMockUser(username = "student@test.local", roles = { "STUDENT" })
    void getUsers_whenStudent_thenForbidden() throws Exception {
        mockMvc.perform(get("/api/users"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "faculty@test.local", roles = { "FACULTY" })
    void getUsers_whenFaculty_thenForbidden() throws Exception {
        mockMvc.perform(get("/api/users"))
            .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@test.local", roles = { "ADMIN" })
    void getUsers_whenAdmin_thenOk() throws Exception {
        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk());
    }
}
