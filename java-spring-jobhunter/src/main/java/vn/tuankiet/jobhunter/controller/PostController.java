package vn.tuankiet.jobhunter.controller;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDate;

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
import vn.tuankiet.jobhunter.domain.Post;
import vn.tuankiet.jobhunter.domain.User;
import vn.tuankiet.jobhunter.domain.response.ResultPaginationDTO;
import vn.tuankiet.jobhunter.domain.response.post.ResCreatePostDTO;
import vn.tuankiet.jobhunter.domain.response.post.ResFetchPostDTO;
import vn.tuankiet.jobhunter.domain.response.post.ResUpdatePostDTO;
import vn.tuankiet.jobhunter.service.PostService;
import vn.tuankiet.jobhunter.service.TransactionService;
import vn.tuankiet.jobhunter.service.UserService;
import vn.tuankiet.jobhunter.util.SecurityUtil;
import vn.tuankiet.jobhunter.util.annotation.ApiMessage;
import vn.tuankiet.jobhunter.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1")
public class PostController {
    private final PostService postService;
    private final UserService userService;
    private final FilterBuilder filterBuilder;
    private final FilterSpecificationConverter filterSpecificationConverter;
    private final TransactionService transactionService;


    public PostController(
            PostService postService,
            UserService userService,
            FilterBuilder filterBuilder,
            FilterSpecificationConverter filterSpecificationConverter,
            TransactionService transactionService) {
        this.postService = postService;
        this.userService = userService;
        this.filterBuilder = filterBuilder;
        this.filterSpecificationConverter = filterSpecificationConverter;
        this.transactionService = transactionService;
    }

    @PostMapping("/posts")
    @ApiMessage("Create a post")
    public ResponseEntity<ResCreatePostDTO> create(@Valid @RequestBody Post post) {
        String email = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        User user = this.userService.handleGetUserByUsername(email);
        this.transactionService.handleCreatePostFee(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(this.postService.create(post));
    }

    @PutMapping("/posts")
    @ApiMessage("Update a post")
    public ResponseEntity<ResUpdatePostDTO> update(@Valid @RequestBody Post post) throws IdInvalidException {
        Optional<Post> currentPost = this.postService.fetchPostById(post.getId());
        if (!currentPost.isPresent()) {
            throw new IdInvalidException("Post not found");
        }
        return ResponseEntity.ok()
                .body(this.postService.update(post, currentPost.get()));
    }

    @DeleteMapping("/posts/{id}")
    @ApiMessage("Delete a post by id")
    public ResponseEntity<Void> delete(@PathVariable("id") long id) throws IdInvalidException {
        Optional<Post> currentPost = this.postService.fetchPostById(id);
        if (!currentPost.isPresent()) {
            throw new IdInvalidException("Post not found");
        }
        this.postService.delete(id);
        return ResponseEntity.ok().body(null);
    }

    @GetMapping("/posts/{id}")
    @ApiMessage("Get a post by id")
    public ResponseEntity<ResFetchPostDTO> getPost(@PathVariable("id") long id) throws IdInvalidException {
        Optional<Post> currentPost = this.postService.fetchPostById(id);
        if (!currentPost.isPresent()) {
            throw new IdInvalidException("Post với id = " + id + " không tồn tại");
        }
        return ResponseEntity.ok().body(this.postService.getPost(currentPost.get()));
    }

    @GetMapping("/posts")
    @ApiMessage("Get post with pagination")
    public ResponseEntity<ResultPaginationDTO> getAllPosts(
            @Filter Specification<Post> spec,
            Pageable pageable) {
        String email = SecurityUtil.getCurrentUserLogin().isPresent()
                ? SecurityUtil.getCurrentUserLogin().get()
                : "";
        User currentUser = this.userService.handleGetUserByUsername(email);
        boolean isHR = currentUser != null && currentUser.getRole() != null &&
                      currentUser.getRole().getName().equalsIgnoreCase("HR");

        if (!isHR) {
            // Nếu không phải HR thì hiển thị tất cả
            return ResponseEntity.ok().body(this.postService.fetchAll(spec, pageable));
        }

        // Nếu là HR thì filter theo company
        final List<Long> arrJobIds;
        if (currentUser != null) {
            Company userCompany = currentUser.getCompany();
            if (userCompany != null) {
                List<Job> companyJobs = userCompany.getJobs();
                if (companyJobs != null && companyJobs.size() > 0) {
                    arrJobIds = companyJobs.stream()
                        .map(job -> job.getId())
                        .collect(Collectors.toList());
                } else {
                    arrJobIds = null;
                }
            } else {
                arrJobIds = null;
            }
        } else {
            arrJobIds = null;
        }

        Specification<Post> jobInSpec = null;
        if (arrJobIds != null && !arrJobIds.isEmpty()) {
            jobInSpec = (root, query, cb) -> {
                return root.get("job").get("id").in(arrJobIds);
            };
        } else {
            // Nếu không có job nào thì filter không trả về gì
            jobInSpec = (root, query, cb) -> {
                return cb.equal(root.get("job").get("id"), -1L);
            };
        }

        Specification<Post> finalSpec = jobInSpec.and(spec);

        return ResponseEntity.ok().body(this.postService.fetchAll(finalSpec, pageable));
    }

    @GetMapping("/posts/clients")
    @ApiMessage("Get all posts for client homepage")
    public ResponseEntity<ResultPaginationDTO> getAllPostsForClient(
            @Filter Specification<Post> spec,
            Pageable pageable) {
        Specification<Post> defaultSpec = (root, query, cb) -> {
            LocalDate today = LocalDate.now();
            return cb.and(
                cb.equal(root.get("active"), true),
                cb.greaterThanOrEqualTo(root.get("endDate"), today)
            );
        };
        
        Specification<Post> finalSpec = spec != null ? 
            defaultSpec.and(spec) : defaultSpec;
            
        return ResponseEntity.ok().body(this.postService.fetchAll(finalSpec, pageable));
    }
}