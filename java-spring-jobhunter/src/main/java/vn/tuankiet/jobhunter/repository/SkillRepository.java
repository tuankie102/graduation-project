package vn.tuankiet.jobhunter.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.tuankiet.jobhunter.domain.Skill;
import vn.tuankiet.jobhunter.domain.response.StatisticsDTO.SkillCount;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long>,
                JpaSpecificationExecutor<Skill> {

        boolean existsByName(String name);

        List<Skill> findByIdIn(List<Long> id);

        @Query(value = "SELECT new vn.tuankiet.jobhunter.domain.response.StatisticsDTO$SkillCount(s.name, COUNT(s), 0) " +
               "FROM Skill s " +
               "JOIN s.jobs j " +
               "GROUP BY s.name " +
               "ORDER BY COUNT(s) DESC " +
               "LIMIT :limit", nativeQuery = false)
        List<SkillCount> findTopRequestedSkills(@Param("limit") int limit);

        @Query(value = "SELECT new vn.tuankiet.jobhunter.domain.response.StatisticsDTO$SkillCount(s.name, COUNT(s), 0) " +
               "FROM Skill s " +
               "JOIN s.jobs j " +
               "JOIN j.posts p " +
               "JOIN p.resumes r " +
               "WHERE r.status = 'APPROVED' " +
               "GROUP BY s.name " +
               "ORDER BY COUNT(s) DESC " +
               "LIMIT :limit", nativeQuery = false)
        List<SkillCount> findTopResumeSkills(@Param("limit") int limit);
}
