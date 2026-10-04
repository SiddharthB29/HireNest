package com.placement.service;

import com.placement.entity.Job;
import com.placement.entity.Student;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PlacementEngineTest {

    private final PlacementEngine placementEngine = new PlacementEngine();

    @Test
    void evaluateAcceptsStudentMeetingEveryConfiguredRequirement() {
        Student student = new Student();
        student.setCgpa(8.0);
        student.setBacklogs(0);
        student.setBranch("CSE");
        student.setSkills(Set.of("Java", "SQL"));
        student.setGraduationYear(2027);

        Job job = new Job();
        job.setMinimumCgpa(7.0);
        job.setMaximumBacklogs(1);
        job.setAllowedBranches(Set.of("CSE", "IT"));
        job.setRequiredSkills(Set.of("Java"));
        job.setGraduationYear(2027);

        EligibilityResult result = placementEngine.evaluate(student, job);

        assertTrue(result.isEligible());
        assertTrue(result.getFailedCriteria().isEmpty());
    }

    @Test
    void evaluateReportsEveryFailedRequirement() {
        Student student = new Student();
        student.setCgpa(6.0);
        student.setBacklogs(3);
        student.setBranch("ME");
        student.setSkills(Set.of("C"));
        student.setGraduationYear(2026);

        Job job = new Job();
        job.setMinimumCgpa(7.0);
        job.setMaximumBacklogs(1);
        job.setAllowedBranches(Set.of("CSE"));
        job.setRequiredSkills(Set.of("Java"));
        job.setGraduationYear(2027);

        EligibilityResult result = placementEngine.evaluate(student, job);

        assertFalse(result.isEligible());
        assertEquals(Set.of("CGPA", "BACKLOGS", "BRANCH", "SKILLS", "GRADUATION_YEAR"),
                Set.copyOf(result.getFailedCriteria()));
    }
}
