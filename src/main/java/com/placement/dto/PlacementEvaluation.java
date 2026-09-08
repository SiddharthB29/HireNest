package com.placement.dto;

public class PlacementEvaluation {

    private Long studentId;
    private String studentName;
    private boolean eligible;
    private java.util.List<String> reasons;

    public PlacementEvaluation(
            Long studentId,
            String studentName,
            boolean eligible,
            java.util.List<String> reasons) {

        this.studentId = studentId;
        this.studentName = studentName;
        this.eligible = eligible;
        this.reasons = reasons;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public boolean isEligible() {
        return eligible;
    }

    public java.util.List<String> getReasons() {
        return reasons;
    }
}