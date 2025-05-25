package vn.tuankiet.jobhunter.domain.response.email;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResEmailResume {
    private JobEmail job;
    private String status;
    private String email;
    private String message;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class JobEmail {
        private String name;
        private CompanyEmail company;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class CompanyEmail {
        private String name;
    }
}
