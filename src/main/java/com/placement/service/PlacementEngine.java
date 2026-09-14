package com.placement.service;

import com.placement.entity.Job;
import com.placement.entity.Student;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class PlacementEngine {

    public EligibilityResult evaluate(Student student, Job job) {

        List<String> failedCriteria = new ArrayList<>();

        // CGPA check
        if (job.getMinimumCgpa() != null) {
            if (student.getCgpa() == null ||
                    student.getCgpa() < job.getMinimumCgpa()) {

                failedCriteria.add("CGPA");
            }
        }

        // Backlogs check
        if (job.getMaximumBacklogs() != null) {
            if (student.getBacklogs() == null ||
                    student.getBacklogs() > job.getMaximumBacklogs()) {

                failedCriteria.add("BACKLOGS");
            }
        }

        // Branch check
        if (job.getAllowedBranches() != null &&
                !job.getAllowedBranches().isEmpty() &&
                !job.getAllowedBranches().contains(student.getBranch())) {

            failedCriteria.add("BRANCH");
        }

        // Required skills check
        if (job.getRequiredSkills() != null &&
                !job.getRequiredSkills().isEmpty()) {

            Set<String> studentSkills = student.getSkills();

            if (studentSkills == null ||
                    !studentSkills.containsAll(job.getRequiredSkills())) {

                failedCriteria.add("SKILLS");
            }
        }

        // Graduation year check
        if (job.getGraduationYear() != null &&
                !job.getGraduationYear().equals(student.getGraduationYear())) {

            failedCriteria.add("GRADUATION_YEAR");
        }

        return new EligibilityResult(
                failedCriteria.isEmpty(),
                failedCriteria
        );
    }
}