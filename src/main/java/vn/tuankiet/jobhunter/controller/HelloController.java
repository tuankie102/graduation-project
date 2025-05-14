package vn.tuankiet.jobhunter.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import vn.tuankiet.jobhunter.domain.User;
import vn.tuankiet.jobhunter.service.UserService;
import vn.tuankiet.jobhunter.util.error.IdInvalidException;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class HelloController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public HelloController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/users")
    public ResponseEntity<User> CreateNewUser(@RequestBody User user) {
        String hashPassword = this.passwordEncoder.encode(user.getPassword());
        user.setPassword(hashPassword);
        User postmanUser = this.userService.handleCreateUser(user);
        // ResponseEntity.ok(postmanUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(postmanUser);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> DeleteUser(@PathVariable("id") long id) throws IdInvalidException {
        if (id > 1500) {
            throw new IdInvalidException("Id khong duoc lon hon 1500");
        }
        this.userService.handleDeleteUser(id);
        return ResponseEntity.ok("Delete a user successful!");
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(this.userService.fetchAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable("id") long id) {

        return ResponseEntity.ok(this.userService.fetchUserById(id));
    }

    @PutMapping("/users")
    public ResponseEntity<User> updateUser(@RequestBody User user) {

        return ResponseEntity.ok(this.userService.handleCreateUser(user));
    }

    @GetMapping("/")
    public String getMethodName() {
        return new String("Hello World");
    }

}
