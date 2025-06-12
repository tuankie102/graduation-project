package vn.tuankiet.jobhunter.domain.response.post;

import java.time.Instant;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResFetchPostDTO {
    private long id;
    private String title;
    private String content;
    private Instant startDate;
    private Instant endDate;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;

    private Long applyCount;

    private JobPost job;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class CompanyPost {
        private long id;
        private String name;
        private String logo;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class SkillPost {
        private long id;
        private String name;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserPost {
        private long id;
        private String name;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class JobPost {
        private long id;
        private String name;
        private String location;
        private double salary;
        private int quantity;
        private String level;
        private String description;
        private List<SkillPost> skills;
        private UserPost user;
        private CompanyPost company;
    }
}
