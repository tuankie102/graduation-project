package vn.tuankiet.jobhunter.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.domain.Specification;

import vn.tuankiet.jobhunter.domain.Transaction;
import vn.tuankiet.jobhunter.domain.User;
import vn.tuankiet.jobhunter.domain.Job;
import vn.tuankiet.jobhunter.domain.Resume;
import vn.tuankiet.jobhunter.domain.Skill;
import vn.tuankiet.jobhunter.domain.response.StatisticsDTO;
import vn.tuankiet.jobhunter.repository.*;
import vn.tuankiet.jobhunter.util.constant.ResumeStateEnum;
import vn.tuankiet.jobhunter.util.constant.LevelEnum;
import vn.tuankiet.jobhunter.util.constant.PaymentStatusEnum;
import vn.tuankiet.jobhunter.util.constant.TransactionTypeEnum;

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
    private final TransactionRepository transactionRepository;

    public StatisticsDTO getAllStatistics(Specification<?> spec) {
        StatisticsDTO statistics = new StatisticsDTO();
        statistics.setUserStatistics(getUserStatistics((Specification<User>) spec));
        statistics.setJobStatistics(getJobStatistics((Specification<Job>) spec));
        statistics.setResumeStatistics(getResumeStatistics((Specification<Resume>) spec));
        statistics.setSkillStatistics(getSkillStatistics((Specification<Skill>) spec));
        statistics.setTransactionStatistics(getTransactionStatistics((Specification<Transaction>) spec));
        return statistics;
    }

    public StatisticsDTO.UserStatistics getUserStatistics(Specification<User> spec) {
        StatisticsDTO.UserStatistics statistics = new StatisticsDTO.UserStatistics();
        
        statistics.setTotalUsers(userRepository.count(spec));
        
        // Get users by role
        Map<String, Long> usersByRole = userRepository.findAll(spec).stream()
            .collect(Collectors.groupingBy(
                user -> user.getRole() != null ? user.getRole().getName() : "Normal User",
                Collectors.counting()
            ));
        statistics.setUsersByRole(usersByRole);

        return statistics;
    }

    public StatisticsDTO.JobStatistics getJobStatistics(Specification<Job> spec) {
        StatisticsDTO.JobStatistics statistics = new StatisticsDTO.JobStatistics();
        
        // Get all jobs with spec
        List<Job> allJobs = jobRepository.findAll(spec);
        
        // Calculate statistics
        statistics.setTotalJobs(allJobs.size());
        statistics.setActiveJobs(allJobs.stream().filter(job -> job.isActive()).count());

        // Get jobs by location
        Map<String, Long> jobsByLocation = allJobs.stream()
            .collect(Collectors.groupingBy(
                job -> job.getLocation(),
                Collectors.counting()
            ));
        statistics.setJobsByLocation(jobsByLocation);

        // Get jobs by company
        Map<String, Long> jobsByCompany = allJobs.stream()
            .collect(Collectors.groupingBy(
                job -> job.getCompany().getName(),
                Collectors.counting()
            ));
        statistics.setJobsByCompany(jobsByCompany);

        // Get jobs by level
        Map<String, Long> jobsByLevel = allJobs.stream()
            .collect(Collectors.groupingBy(
                job -> job.getLevel().toString(),
                Collectors.counting()
            ));
        statistics.setJobsByLevel(jobsByLevel);

        return statistics;
    }

    public StatisticsDTO.ResumeStatistics getResumeStatistics(Specification<Resume> spec) {
        StatisticsDTO.ResumeStatistics statistics = new StatisticsDTO.ResumeStatistics();
        
        // Get all resumes with spec
        List<Resume> allResumes = resumeRepository.findAll(spec);
        
        // Calculate statistics
        statistics.setTotalResumes(allResumes.size());
        statistics.setApprovedResumes(allResumes.stream().filter(r -> r.getStatus() == ResumeStateEnum.APPROVED).count());
        statistics.setPendingResumes(allResumes.stream().filter(r -> r.getStatus() == ResumeStateEnum.PENDING).count());
        statistics.setRejectedResumes(allResumes.stream().filter(r -> r.getStatus() == ResumeStateEnum.REJECTED).count());
        statistics.setReviewingResumes(allResumes.stream().filter(r -> r.getStatus() == ResumeStateEnum.REVIEWING).count());        
        // Get resumes by status
        Map<ResumeStateEnum, Long> resumesByStatus = allResumes.stream()
            .collect(Collectors.groupingBy(
                resume -> resume.getStatus(),
                Collectors.counting()
            ));
        statistics.setResumesByStatus(resumesByStatus);

        return statistics;
    }

    public StatisticsDTO.SkillStatistics getSkillStatistics(Specification<Skill> spec) {
        StatisticsDTO.SkillStatistics statistics = new StatisticsDTO.SkillStatistics();
        
        // Get all skills with spec
        List<Skill> allSkills = skillRepository.findAll(spec);
        
        // Get skills by name
        Map<String, Long> skillsByCategory = allSkills.stream()
            .collect(Collectors.groupingBy(
                skill -> skill.getName(),
                Collectors.counting()
            ));
        statistics.setSkillsByCategory(skillsByCategory);

        // Get top requested skills from all skills
        List<StatisticsDTO.SkillCount> topRequestedSkills = allSkills.stream()
            .map(skill -> {
                long count = skill.getJobs().stream()
                    .filter(job -> job.isActive())
                    .count();
                StatisticsDTO.SkillCount skillCount = new StatisticsDTO.SkillCount();
                skillCount.setName(skill.getName());
                skillCount.setCount(count);
                return skillCount;
            })
            .filter(skill -> skill.getCount() > 0)
            .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
            .limit(10)
            .collect(Collectors.toList());
        statistics.setTopRequestedSkills(topRequestedSkills);

        // Get top resume skills from all skills
        List<StatisticsDTO.SkillCount> topResumeSkills = allSkills.stream()
            .map(skill -> {
                long count = skill.getJobs().stream()
                    .flatMap(job -> job.getPosts().stream())
                    .flatMap(post -> post.getResumes().stream())
                    .filter(resume -> resume.getStatus() == ResumeStateEnum.APPROVED)
                    .count();
                StatisticsDTO.SkillCount skillCount = new StatisticsDTO.SkillCount();
                skillCount.setName(skill.getName());
                skillCount.setCount(count);
                return skillCount;
            })
            .filter(skill -> skill.getCount() > 0)
            .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
            .limit(10)
            .collect(Collectors.toList());
        statistics.setTopResumeSkills(topResumeSkills);

        return statistics;
    }

    public StatisticsDTO.TransactionStatistics getTransactionStatistics(Specification<Transaction> spec) {
        StatisticsDTO.TransactionStatistics statistics = new StatisticsDTO.TransactionStatistics();
        List<Transaction> allTransactions = transactionRepository.findAll(spec);
        
        // Get total transactions
        statistics.setTotalTransactions(allTransactions.size());
        
        // Calculate total deposit revenue (only successful deposits)
        double totalDepositRevenue = allTransactions.stream()
            .filter(t -> t.getTransactionType() == TransactionTypeEnum.DEPOSIT && 
                        t.getPaymentStatus() == PaymentStatusEnum.SUCCESS)
            .mapToDouble(t -> t.getAmount())
            .sum();
        statistics.setTotalDepositRevenue(totalDepositRevenue);

        // Calculate apply fee statistics
        long totalApplyFeeTransactions = allTransactions.stream()
            .filter(t -> t.getTransactionType() == TransactionTypeEnum.APPLY_FEE)
            .count();
        double totalApplyFeeAmount = allTransactions.stream()
            .filter(t -> t.getTransactionType() == TransactionTypeEnum.APPLY_FEE)
            .mapToDouble(t -> t.getAmount())
            .sum();
        statistics.setTotalApplyFeeTransactions(totalApplyFeeTransactions);
        statistics.setTotalApplyFeeAmount(totalApplyFeeAmount);

        // Calculate post fee statistics
        long totalPostFeeTransactions = allTransactions.stream()
            .filter(t -> t.getTransactionType() == TransactionTypeEnum.POST_FEE)
            .count();
        double totalPostFeeAmount = allTransactions.stream()
            .filter(t -> t.getTransactionType() == TransactionTypeEnum.POST_FEE)
            .mapToDouble(t -> t.getAmount())
            .sum();
        statistics.setTotalPostFeeTransactions(totalPostFeeTransactions);
        statistics.setTotalPostFeeAmount(totalPostFeeAmount);

        // Calculate total available balance from user balances
        double totalAvailableBalance = userRepository.findAll().stream()
            .mapToDouble(user -> user.getBalance())
            .sum();
        statistics.setTotalAvailableBalance(totalAvailableBalance);

        // Get transactions by status
        Map<PaymentStatusEnum, Long> transactionsByStatus = allTransactions.stream()
            .collect(Collectors.groupingBy(
                transaction -> transaction.getPaymentStatus(),
                Collectors.counting()
            ));
        statistics.setTransactionsByStatus(transactionsByStatus);

        // Calculate revenue by status
        Map<PaymentStatusEnum, Double> revenueByStatus = allTransactions.stream()
            .collect(Collectors.groupingBy(
                transaction -> transaction.getPaymentStatus(),
                Collectors.summingDouble(transaction -> transaction.getAmount())
            ));
        statistics.setRevenueByStatus(revenueByStatus);

        return statistics;
    }
} 