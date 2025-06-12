package vn.tuankiet.jobhunter.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vn.tuankiet.jobhunter.domain.Resume;
import vn.tuankiet.jobhunter.util.constant.ResumeStateEnum;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long>,
                JpaSpecificationExecutor<Resume> {
    long countByStatus(ResumeStateEnum status);

    long countByUserIdAndPostId(Long userId, Long postId);

    long countByPostId(Long postId);

}
