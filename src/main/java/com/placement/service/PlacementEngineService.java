package com.placement.service;

import com.placement.dto.PlacementResult;
import com.placement.entity.Job;
import com.placement.entity.Student;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PlacementEngineService {

    public PlacementResult evaluate(Student student, Job job) {

        List<String> reasons = new ArrayList<>();

        // CGPA check
        if (job.getMinimumCgpa() != null &&
                student.getCgpa() < job.getMinimumCgpa()) {

            reasons.add("CGPA is below the minimum requirement");
        }

        // Backlog check
        if (job.getMaximumBacklogs() != null &&
                student.getBacklogs() > job.getMaximumBacklogs()) {

            reasons.add("Student has more backlogs than allowed");
        }

        // Branch check
        if (job.getAllowedBranches() != null &&
                !job.getAllowedBranches().isEmpty() &&
                !job.getAllowedBranches().contains(student.getBranch())) {

            reasons.add("Student's branch is not eligible");
        }

        // Skills check
        if (job.getRequiredSkills() != null &&
                !job.getRequiredSkills().isEmpty()) {

            if (student.getSkills() == null ||
                    !student.getSkills().containsAll(job.getRequiredSkills())) {

                reasons.add("Student does not have all required skills");
            }
        }

        // Graduation year check
        if (job.getGraduationYear() != null &&
                !job.getGraduationYear().equals(student.getGraduationYear())) {

            reasons.add("Student's graduation year does not match the requirement");
        }

        return new PlacementResult(
                reasons.isEmpty(),
                reasons
        );
    }
}