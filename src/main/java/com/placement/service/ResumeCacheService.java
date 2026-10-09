package com.placement.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class ResumeCacheService {

    private final StringRedisTemplate redisTemplate;

    public ResumeCacheService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void cacheResumeText(Long studentId, String text) {

        String key = "resume:text:" + studentId;

        redisTemplate.opsForValue().set(
                key,
                text,
                Duration.ofHours(24)
        );
    }

    public String getResumeText(Long studentId) {

        String key = "resume:text:" + studentId;

        return redisTemplate.opsForValue().get(key);
    }

    public void deleteResumeText(Long studentId) {

        String key = "resume:text:" + studentId;

        redisTemplate.delete(key);
    }
}