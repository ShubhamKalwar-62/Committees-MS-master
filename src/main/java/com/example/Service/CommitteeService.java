package com.example.Service;

import com.example.Entity.Committee;
import com.example.Entity.Login;
import com.example.Repository.CommitteeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommitteeService {

    @Autowired
    private CommitteeRepository committeeRepository;

    public List<Committee> getAllCommittees() {
        return committeeRepository.findAll();
    }
    
    public Optional<Committee> getCommitteeById(Integer id) {
        return committeeRepository.findById(id);
    }
    
    public Optional<Committee> getCommitteeByLogin(Login login) {
        return committeeRepository.findByLogin(login);
    }
    
    public List<Committee> getCommitteesByNameContaining(String name) {
        return committeeRepository.findByCommitteeNameContaining(name);
    }
    
    public List<Committee> getCommitteesByFacultyName(String facultyName) {
        return committeeRepository.findByFacultyInchargeName(facultyName);
    }
    
    public Committee saveCommittee(Committee committee) {
        return committeeRepository.save(committee);
    }
    
    public void deleteCommittee(Integer id) {
        committeeRepository.deleteById(id);
    }
    
    public Committee updateCommittee(Integer id, Committee committeeDetails) {
        Optional<Committee> existingCommittee = committeeRepository.findById(id);
        if (existingCommittee.isPresent()) {
            Committee committee = existingCommittee.get();
            committee.setCommitteeName(committeeDetails.getCommitteeName());
            committee.setFacultyInchargeName(committeeDetails.getFacultyInchargeName());
            committee.setFacultyPosition(committeeDetails.getFacultyPosition());
            committee.setCommitteeInfo(committeeDetails.getCommitteeInfo());
            return committeeRepository.save(committee);
        }
        return null;
    }
}