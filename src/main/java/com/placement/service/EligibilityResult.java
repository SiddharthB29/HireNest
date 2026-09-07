package com.placement.service;

import java.util.List;

public class EligibilityResult {

    private boolean eligible;
    private List<String> failedCriteria;

    public EligibilityResult(boolean eligible, List<String> failedCriteria) {
        this.eligible = eligible;
        this.failedCriteria = failedCriteria;
    }

    public boolean isEligible() {
        return eligible;
    }

    public List<String> getFailedCriteria() {
        return failedCriteria;
    }
}