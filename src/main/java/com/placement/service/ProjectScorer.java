package com.placement.service;

import com.placement.entity.Job;
import com.placement.entity.Student;
import org.springframework.stereotype.Service;

@Service
public class ProjectScorer {

    public double calculateScore(Student student, Job job) {

        Integer projectCount = student.getProjectCount();

        if (projectCount == null || projectCount <= 0) {
            return 0.0;
        }

        if (projectCount == 1) {
            return 40.0;
        }

        if (projectCount == 2) {
            return 70.0;
        }

        if (projectCount == 3) {
            return 90.0;
        }

        return 100.0;
    }
}