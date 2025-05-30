package vn.tuankiet.jobhunter.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.tuankiet.jobhunter.domain.response.StatisticsDTO;
import vn.tuankiet.jobhunter.service.StatisticsService;

@RestController
@RequestMapping("/api/v1/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping
    public ResponseEntity<StatisticsDTO> getAllStatistics() {
        return ResponseEntity.ok(statisticsService.getAllStatistics());
    }

    @GetMapping("/users")
    public ResponseEntity<StatisticsDTO.UserStatistics> getUserStatistics() {
        return ResponseEntity.ok(statisticsService.getUserStatistics());
    }

    @GetMapping("/jobs")
    public ResponseEntity<StatisticsDTO.JobStatistics> getJobStatistics() {
        return ResponseEntity.ok(statisticsService.getJobStatistics());
    }

    @GetMapping("/resumes")
    public ResponseEntity<StatisticsDTO.ResumeStatistics> getResumeStatistics() {
        return ResponseEntity.ok(statisticsService.getResumeStatistics());
    }

    @GetMapping("/skills")
    public ResponseEntity<StatisticsDTO.SkillStatistics> getSkillStatistics() {
        return ResponseEntity.ok(statisticsService.getSkillStatistics());
    }
} 