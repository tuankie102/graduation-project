package vn.tuankiet.jobhunter.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vn.tuankiet.jobhunter.domain.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}
