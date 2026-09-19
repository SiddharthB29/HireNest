package com.placement.service;

import com.placement.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JWTService {
    private final SecretKey key;

    public JWTService(@Value("${jwt.secret}") String secret) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.key = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(User user) {
        var builder = Jwts.builder()
                .subject(user.getUsername())
                .claim("role", user.getRole().name())
                .claim("userId", user.getId())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60));

        if (user.getStudent() != null) {
            builder.claim("studentId", user.getStudent().getId());
        }

        if (user.getCompany() != null) {
            builder.claim("companyId", user.getCompany().getId());
            builder.claim("companyName", user.getCompany().getName());
        }

        return builder.signWith(key).compact();
    }
    public Jws<Claims> validateToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
    }
}
