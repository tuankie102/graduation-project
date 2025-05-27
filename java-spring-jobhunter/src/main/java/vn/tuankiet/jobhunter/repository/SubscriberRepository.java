package vn.tuankiet.jobhunter.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import vn.tuankiet.jobhunter.domain.Subscriber;
import vn.tuankiet.jobhunter.domain.Skill;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriberRepository extends JpaRepository<Subscriber, Long>,
                JpaSpecificationExecutor<Subscriber> {

        boolean existsByEmail(String email);

        Optional<Subscriber> findByEmail(String email);

        List<Subscriber> findBySkillsIn(List<Skill> skills);
}
