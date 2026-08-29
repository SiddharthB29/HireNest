package com.placement.dto;

import com.placement.entity.Role;

public class AuthResponse {
    private Long id;
    private String userName;
    private Role role;

    public AuthResponse(Long id, String username, Role role) {
        this.id = id;
        this.userName = username;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return userName;
    }

    public Role getRole() {
        return role;
    }
}
