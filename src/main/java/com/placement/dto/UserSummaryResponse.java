package com.placement.dto;

import com.placement.entity.Role;

/**
 * Lightweight account summary for admin listings (recruiter accounts).
 * Deliberately excludes credentials and student linkage.
 */
public class UserSummaryResponse {

    private Long id;
    private String userName;
    private Role role;
    private Long companyId;
    private String companyName;

    public UserSummaryResponse() {
    }

    public UserSummaryResponse(Long id, String userName, Role role,
                               Long companyId, String companyName) {
        this.id = id;
        this.userName = userName;
        this.role = role;
        this.companyId = companyId;
        this.companyName = companyName;
    }

    public Long getId() {
        return id;
    }

    public String getUserName() {
        return userName;
    }

    public Role getRole() {
        return role;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public String getCompanyName() {
        return companyName;
    }
}
