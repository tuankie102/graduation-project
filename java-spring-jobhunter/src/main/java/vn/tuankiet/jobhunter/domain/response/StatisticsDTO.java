package vn.tuankiet.jobhunter.domain.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;
import java.util.Map;
import vn.tuankiet.jobhunter.util.constant.ResumeStateEnum;
import vn.tuankiet.jobhunter.util.constant.PaymentStatusEnum;
import vn.tuankiet.jobhunter.util.constant.TransactionTypeEnum;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class StatisticsDTO {
    private UserStatistics userStatistics;
    private JobStatistics jobStatistics;
    private ResumeStatistics resumeStatistics;
    private SkillStatistics skillStatistics;
    private TransactionStatistics transactionStatistics;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserStatistics {
        private long totalUsers;
        private Map<String, Long> usersByRole;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class JobStatistics {
        private long totalJobs;
        private long activeJobs;
        private Map<String, Long> jobsByLocation;
        private Map<String, Long> jobsByCompany;
        private Map<String, Long> jobsByLevel;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ResumeStatistics {
        private long totalResumes;
        private long approvedResumes;
        private long pendingResumes;
        private long reviewingResumes;
        private long rejectedResumes;
        private Map<ResumeStateEnum, Long> resumesByStatus;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SkillStatistics {
        private List<SkillCount> topRequestedSkills;
        private List<SkillCount> topResumeSkills;
        private Map<String, Long> skillsByCategory;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SkillCount {
        private String name;
        private long count;
        private long approvedCount;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TransactionStatistics {
        private long totalTransactions;
        private double totalDepositRevenue;
        private long totalApplyFeeTransactions;
        private double totalApplyFeeAmount;
        private long totalPostFeeTransactions;
        private double totalPostFeeAmount;
        private double totalAvailableBalance;
        private Map<PaymentStatusEnum, Long> transactionsByStatus;
        private Map<PaymentStatusEnum, Double> revenueByStatus;
    }
} 