package com.example.Service;

import java.util.List;
import java.util.Optional;

import com.example.Entity.Committee;
import com.example.Entity.Login;

public interface CommitteeService {
    List<Committee> getAllCommittees();
    Optional<Committee> getCommitteeById(Integer id);
    Optional<Committee> getCommitteeByLogin(Login login);
    List<Committee> getCommitteesByNameContaining(String name);
    List<Committee> getCommitteesByFacultyName(String facultyName);
    Committee saveCommittee(Committee committee);
    void deleteCommittee(Integer id);
    Committee updateCommittee(Integer id, Committee committeeDetails);
}