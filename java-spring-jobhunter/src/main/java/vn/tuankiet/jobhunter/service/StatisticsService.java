package vn.tuankiet.jobhunter.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import vn.tuankiet.jobhunter.domain.response.StatisticsDTO;
import vn.tuankiet.jobhunter.repository.*;
import vn.tuankiet.jobhunter.util.constant.ResumeStateEnum;
import vn.tuankiet.jobhunter.util.constant.LevelEnum;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final SkillRepository skillRepository;

    
    public StatisticsDTO getAllStatistics() {
        StatisticsDTO statistics = new StatisticsDTO();
        statistics.setUserStatistics(getUserStatistics());
        statistics.setJobStatistics(getJobStatistics());
        statistics.setResumeStatistics(getResumeStatistics());
        statistics.setSkillStatistics(getSkillStatistics());
        return statistics;
    }

    
    public StatisticsDTO.UserStatistics getUserStatistics() {
        StatisticsDTO.UserStatistics statistics = new StatisticsDTO.UserStatistics();
        
        statistics.setTotalUsers(userRepository.count());
        
        // Get users by role
        Map<String, Long> usersByRole = userRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                user -> user.getRole() != null ? user.getRole().getName() : "Normal User",
                Collectors.counting()
            ));
        statistics.setUsersByRole(usersByRole);

        return statistics;
    }

    
    public StatisticsDTO.JobStatistics getJobStatistics() {
        StatisticsDTO.JobStatistics statistics = new StatisticsDTO.JobStatistics();
        
        statistics.setTotalJobs(jobRepository.count());
        statistics.setActiveJobs(jobRepository.countByActive(true));

        // Get jobs by location
        Map<String, Long> jobsByLocation = jobRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                job -> job.getLocation(),
                Collectors.counting()
            ));
        statistics.setJobsByLocation(jobsByLocation);

        // Get jobs by company
        Map<String, Long> jobsByCompany = jobRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                job -> job.getCompany().getName(),
                Collectors.counting()
            ));
        statistics.setJobsByCompany(jobsByCompany);

        // Get jobs by level
        Map<String, Long> jobsByLevel = jobRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                job -> job.getLevel().toString(),
                Collectors.counting()
            ));
        statistics.setJobsByLevel(jobsByLevel);

        return statistics;
    }

    
    public StatisticsDTO.ResumeStatistics getResumeStatistics() {
        StatisticsDTO.ResumeStatistics statistics = new StatisticsDTO.ResumeStatistics();
        
        statistics.setTotalResumes(resumeRepository.count());
        statistics.setApprovedResumes(resumeRepository.countByStatus(ResumeStateEnum.APPROVED));
        statistics.setPendingResumes(resumeRepository.countByStatus(ResumeStateEnum.PENDING));
        statistics.setRejectedResumes(resumeRepository.countByStatus(ResumeStateEnum.REJECTED));

        // Get resumes by status
        Map<ResumeStateEnum, Long> resumesByStatus = resumeRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                resume -> resume.getStatus(),
                Collectors.counting()
            ));
        statistics.setResumesByStatus(resumesByStatus);

        return statistics;
    }

    
    public StatisticsDTO.SkillStatistics getSkillStatistics() {
        StatisticsDTO.SkillStatistics statistics = new StatisticsDTO.SkillStatistics();
        
        // Get top requested skills
        List<StatisticsDTO.SkillCount> topRequestedSkills = skillRepository.findTopRequestedSkills(10);
        statistics.setTopRequestedSkills(topRequestedSkills);

        // Get top resume skills
        List<StatisticsDTO.SkillCount> topResumeSkills = skillRepository.findTopResumeSkills(10);
        statistics.setTopResumeSkills(topResumeSkills);

        // Get skills by name (since there's no category field)
        Map<String, Long> skillsByCategory = skillRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                skill -> skill.getName(),
                Collectors.counting()
            ));
        statistics.setSkillsByCategory(skillsByCategory);

        return statistics;
    }
} 