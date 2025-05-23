package vn.tuankiet.jobhunter.domain.response.post;

import java.time.Instant;

import vn.tuankiet.jobhunter.domain.User;

import lombok.Getter;
import lombok.Setter;
import vn.tuankiet.jobhunter.domain.Job;

@Getter
@Setter
public class ResCreatePostDTO {
    private long id;
    private String title;

    private String content;

    private Instant startDate;
    private Instant endDate;
    private boolean active;

    private Job job;
    private User user;

    private Instant createdAt;
    private String createdBy;

}