package com.placement.service;

import com.placement.entity.Job;
import com.placement.entity.Student;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class SkillScorer {

    public double calculateScore(Student student, Job job) {

        Set<String> preferredSkills = job.getPreferredSkills();
        Set<String> studentSkills = student.getSkills();

        if (preferredSkills == null || preferredSkills.isEmpty()) {
            return 0.0;
        }

        if (studentSkills == null || studentSkills.isEmpty()) {
            return 0.0;
        }

        long matchedSkills = preferredSkills.stream()
                .filter(studentSkills::contains)
                .count();

        return (matchedSkills * 100.0) / preferredSkills.size();
    }
}