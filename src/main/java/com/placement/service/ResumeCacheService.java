package com.placement.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class ResumeCacheService {

    private static final Logger logger =
            LoggerFactory.getLogger(ResumeCacheService.class);

    private final StringRedisTemplate redisTemplate;

    public ResumeCacheService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void cacheResumeText(Long studentId, String text) {
        String key = "resume:text:" + studentId;

        try {
            redisTemplate.opsForValue().set(
                    key,
                    text,
                    Duration.ofHours(24)
            );

            logger.info("Resume cache write succeeded for student {}.", studentId);

        } catch (Exception e) {
            logger.warn(
                    "Resume cache write failed for student {}. Continuing without cache.",
                    studentId,
                    e
            );
        }
    }

    public String getResumeText(Long studentId) {
        String key = "resume:text:" + studentId;

        try {
            String cachedText = redisTemplate.opsForValue().get(key);

            if (cachedText != null) {
                logger.info("Resume cache read succeeded for student {}.", studentId);
            } else {
                logger.info("Resume cache miss for student {}.", studentId);
            }

            return cachedText;

        } catch (Exception e) {
            logger.warn(
                    "Resume cache read failed for student {}. Recovering from storage.",
                    studentId,
                    e
            );
            return null;
        }
    }

    public void deleteResumeText(Long studentId) {
        String key = "resume:text:" + studentId;

        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            logger.warn(
                    "Resume cache deletion failed for student {}.",
                    studentId,
                    e
            );
        }
    }
}