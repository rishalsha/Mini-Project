package com.portfolio.backend.repository;

import com.portfolio.backend.entity.ResumeAnalysisEntity;
import com.portfolio.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysisEntity, Long> {
    List<ResumeAnalysisEntity> findByUser(User user);

    void deleteByUser(User user);
}
