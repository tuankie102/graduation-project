package vn.tuankiet.jobhunter.domain.response.resume;

import java.time.Instant;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import vn.tuankiet.jobhunter.util.constant.ResumeStateEnum;

@Getter
@Setter
public class ResFetchResumeDTO {
    private long id;
    private String email;
    private String url;

    @Enumerated(EnumType.STRING)
    private ResumeStateEnum status;

    private Instant createdAt;
    private Instant updatedAt;

    private String createdBy;
    private String updatedBy;

    private String companyName;
    private String jobName;
    private UserResume user;
    private PostResume post;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class UserResume {
        private long id;
        private String name;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class PostResume {
        private long id;
        private String name;
    }
}
