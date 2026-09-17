package com.placement.service;

import com.placement.entity.Job;
import com.placement.entity.Student;
import org.springframework.stereotype.Service;

@Service
public class CgpaScorer {

    private static final double MAX_CGPA = 10.0;

    public double calculateScore(Student student, Job job) {

        if (student.getCgpa() == null) {
            return 0.0;
        }

        double score = (student.getCgpa() / MAX_CGPA) * 100.0;

        return Math.min(score, 100.0);
    }
}