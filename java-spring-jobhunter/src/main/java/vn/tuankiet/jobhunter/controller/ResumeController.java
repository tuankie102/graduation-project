package vn.tuankiet.jobhunter.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.turkraft.springfilter.boot.Filter;
import com.turkraft.springfilter.builder.FilterBuilder;
import com.turkraft.springfilter.converter.FilterSpecificationConverter;

import jakarta.validation.Valid;
import vn.tuankiet.jobhunter.domain.Company;
import vn.tuankiet.jobhunter.domain.Job;
import vn.tuankiet.jobhunter.domain.Resume;
import vn.tuankiet.jobhunter.domain.User;
import vn.tuankiet.jobhunter.domain.response.ResultPaginationDTO;
import vn.tuankiet.jobhunter.domain.response.email.ResEmailResume;
import vn.tuankiet.jobhunter.domain.response.resume.ResCreateResumeDTO;
import vn.tuankiet.jobhunter.domain.response.resume.ResFetchResumeDTO;
import vn.tuankiet.jobhunter.domain.response.resume.ResUpdateResumeDTO;
import vn.tuankiet.jobhunter.service.EmailService;
import vn.tuankiet.jobhunter.service.ResumeService;
import vn.tuankiet.jobhunter.service.UserService;
import vn.tuankiet.jobhunter.util.SecurityUtil;
import vn.tuankiet.jobhunter.util.annotation.ApiMessage;
import vn.tuankiet.jobhunter.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1")
public class ResumeController {

    private final ResumeService resumeService;
    private final UserService userService;
    private final EmailService emailService;
    private final FilterBuilder filterBuilder;
    private final FilterSpecificationConverter filterSpecificationConverter;

    public ResumeController(
            ResumeService resumeService,
            UserService userService,
            EmailService emailService,
            FilterBuilder filterBuilder,
            FilterSpecificationConverter filterSpecificationConverter) {
        this.resumeService = resumeService;
        this.userService = userService;
        this.emailService = emailService;
        this.filterBuilder = filterBuilder;
        this.filterSpecificationConverter = filterSpecificationConverter;
    }

    @PostMapping("/resumes")
    @ApiMessage("Create a resume")
    public ResponseEntity<ResCreateResumeDTO> create(@Valid @RequestBody Resume resume) throws IdInvalidException {
        // check id exists
        boolean isIdExist = this.resumeService.checkResumeExistByUserAndPost(resume);
        if (!isIdExist) {
            throw new IdInvalidException("User id/Post id không tồn tại");
        }

        // create new resume
        return ResponseEntity.status(HttpStatus.CREATED).body(this.resumeService.create(resume));
    }

    @PutMapping("/resumes")
    @ApiMessage("Update a resume")
    public ResponseEntity<ResUpdateResumeDTO> update(@RequestBody Resume resume) throws IdInvalidException {
        // check id exist
        Optional<Resume> reqResumeOptional = this.resumeService.fetchById(resume.getId());
        if (reqResumeOptional.isEmpty()) {
            throw new IdInvalidException("Resume với id = " + resume.getId() + " không tồn tại");
        }

        Resume reqResume = reqResumeOptional.get();
        reqResume.setStatus(resume.getStatus());

        //send email
        String message = "just a message";
        ResEmailResume resEmailResume = this.resumeService.convertResumeToSendEmail(reqResume, message);
        this.emailService.sendEmailFromTemplateSync(
        resEmailResume.getEmail(),
        "Your Resume Status Update - " + reqResume.getPost().getJob().getName(),
        "resume",
        reqResume.getUser().getName(),
        "resume",
        resEmailResume
        );

        return ResponseEntity.ok().body(this.resumeService.update(reqResume));
    }

    @DeleteMapping("/resumes/{id}")
    @ApiMessage("Delete a resume by id")
    public ResponseEntity<Void> delete(@PathVariable("id") long id) throws IdInvalidException {
        Optional<Resume> reqResumeOptional = this.resumeService.fetchById(id);
        if (reqResumeOptional.isEmpty()) {
            throw new IdInvalidException("Resume với id = " + id + " không tồn tại");
        }

        this.resumeService.delete(id);
        return ResponseEntity.ok().body(null);
    }

    @GetMapping("/resumes/{id}")
    @ApiMessage("Fetch a resume by id")
    public ResponseEntity<ResFetchResumeDTO> fetchById(@PathVariable("id") long id) throws IdInvalidException {
        Optional<Resume> reqResumeOptional = this.resumeService.fetchById(id);
        if (reqResumeOptional.isEmpty()) {
            throw new IdInvalidException("Resume với id = " + id + " không tồn tại");
        }

        return ResponseEntity.ok().body(this.resumeService.getResume(reqResumeOptional.get()));
    }

    @GetMapping("/resumes")
    @ApiMessage("Fetch all resume with paginate")
    public ResponseEntity<ResultPaginationDTO> fetchAll(
            @Filter Specification<Resume> spec,
            Pageable pageable) {
        final List<Long> arrPostIds;
        String email = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        User currentUser = this.userService.handleGetUserByUsername(email);
        boolean isSuperAdmin = currentUser != null && currentUser.getRole().getName().equalsIgnoreCase("SUPER_ADMIN");
        if (isSuperAdmin) {
            // Không filter theo post, chỉ dùng spec truyền vào
            return ResponseEntity.ok().body(this.resumeService.fetchAllResume(spec, pageable));
        }
        if (currentUser != null) {
            Company userCompany = currentUser.getCompany();
            if (userCompany != null) {
                List<Job> companyJobs = userCompany.getJobs();
                if (companyJobs != null && companyJobs.size() > 0) {
                    arrPostIds = companyJobs.stream()
                        .flatMap(job -> job.getPosts() != null ? job.getPosts().stream() : java.util.stream.Stream.empty())
                        .map(post -> post.getId())
                        .collect(Collectors.toList());
                } else {
                    arrPostIds = null;
                }
            } else {
                arrPostIds = null;
            }
        } else {
            arrPostIds = null;
        }

        Specification<Resume> postInSpec = null;
        if (arrPostIds != null && !arrPostIds.isEmpty()) {
            postInSpec = (root, query, cb) -> {
                return root.get("post").get("id").in(arrPostIds);
            };
        } else {
            // Nếu không có post nào thì filter không trả về gì
            postInSpec = (root, query, cb) -> {
                return cb.equal(root.get("post").get("id"), -1L);
            };
        }

        Specification<Resume> finalSpec = postInSpec.and(spec);

        return ResponseEntity.ok().body(this.resumeService.fetchAllResume(finalSpec, pageable));
    }

    @PostMapping("/resumes/by-user")
    @ApiMessage("Get list resumes by user")
    public ResponseEntity<ResultPaginationDTO> fetchResumeByUser(Pageable pageable) {

        return ResponseEntity.ok().body(this.resumeService.fetchResumeByUser(pageable));
    }
}
