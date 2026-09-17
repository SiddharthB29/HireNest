package com.placement.service;

import com.placement.entity.Job;
import com.placement.entity.Student;
import org.springframework.stereotype.Service;

@Service
public class CertificationScorer {

    public double calculateScore(Student student, Job job) {

        Integer certificationCount = student.getCertificationCount();

        if (certificationCount == null || certificationCount <= 0) {
            return 0.0;
        }

        if (certificationCount == 1) {
            return 50.0;
        }

        if (certificationCount == 2) {
            return 75.0;
        }

        if (certificationCount == 3) {
            return 90.0;
        }

        return 100.0;
    }
}