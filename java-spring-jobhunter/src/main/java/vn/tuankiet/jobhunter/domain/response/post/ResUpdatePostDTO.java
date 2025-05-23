package vn.tuankiet.jobhunter.domain.response.post;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResUpdatePostDTO {
    private long id;
    private String title;
    private String content;

    private Instant startDate;
    private Instant endDate;
    private boolean active;

    private JobDTO job;
    private UserDTO user;

    private Instant updatedAt;
    private String updatedBy;

    @Getter
    @Setter
    public static class JobDTO {
        private long id;
        private String name;
        private String location;
        private double salary;
        private int quantity;
        private String level;
        private String description;
    }

    @Getter
    @Setter
    public static class UserDTO {
        private long id;
        private String name;
        private String email;
    }
}