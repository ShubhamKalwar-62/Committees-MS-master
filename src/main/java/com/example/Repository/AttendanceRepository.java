package com.example.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.Entity.Attendance;
import com.example.Entity.Events;
import com.example.Entity.Users;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    List<Attendance> findByEvent(Events event);

    List<Attendance> findByUser(Users user);

    List<Attendance> findByStatus(String status);
}
