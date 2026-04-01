package com.example.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.Entity.Committee;
import com.example.Entity.Login;
import com.example.Exception.ResourceNotFoundException;
import com.example.Repository.CommitteeRepository;

@Service
public class CommitteeServiceImpl implements CommitteeService {

    @Autowired
    private CommitteeRepository committeeRepository;

    @Override
    public List<Committee> getAllCommittees() {
        return committeeRepository.findAll();
    }

    @Override
    public Optional<Committee> getCommitteeById(Integer id) {
        return committeeRepository.findById(id);
    }

    @Override
    public Optional<Committee> getCommitteeByLogin(Login login) {
        return committeeRepository.findByLogin(login);
    }

    @Override
    public List<Committee> getCommitteesByNameContaining(String name) {
        return committeeRepository.findByCommitteeNameContaining(name);
    }

    @Override
    public List<Committee> getCommitteesByFacultyName(String facultyName) {
        return committeeRepository.findByFacultyInchargeName(facultyName);
    }

    @Override
    public Committee saveCommittee(Committee committee) {
        return committeeRepository.save(committee);
    }

    @Override
    public void deleteCommittee(Integer id) {
        committeeRepository.deleteById(id);
    }

    @Override
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
        throw new ResourceNotFoundException("Committee not found with id: " + id);
    }
}
