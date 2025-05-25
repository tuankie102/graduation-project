package vn.tuankiet.jobhunter.service;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import vn.tuankiet.jobhunter.domain.Post;
import vn.tuankiet.jobhunter.domain.Resume;
import vn.tuankiet.jobhunter.domain.Job;
import vn.tuankiet.jobhunter.domain.User;

import vn.tuankiet.jobhunter.domain.response.post.ResCreatePostDTO;
import vn.tuankiet.jobhunter.domain.response.post.ResUpdatePostDTO;
import vn.tuankiet.jobhunter.domain.response.post.ResFetchPostDTO;
import vn.tuankiet.jobhunter.domain.response.ResultPaginationDTO;
import vn.tuankiet.jobhunter.repository.PostRepository;
import vn.tuankiet.jobhunter.repository.JobRepository;
import vn.tuankiet.jobhunter.repository.UserRepository;
import vn.tuankiet.jobhunter.repository.ResumeRepository;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    public PostService(PostRepository postRepository, JobRepository jobRepository, UserRepository userRepository, ResumeRepository resumeRepository) {
        this.postRepository = postRepository;
        this.jobRepository = jobRepository;
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
    }

    public Optional<Post> fetchPostById(long id) {
        return this.postRepository.findById(id);
    }

    public ResCreatePostDTO create(Post post) {
        // check job
        if (post.getJob() != null) {
            Optional<Job> jobOptional = this.jobRepository.findById(post.getJob().getId());
            post.setJob(jobOptional.orElse(null));
        }
        // check user
        if (post.getUser() != null) {
            Optional<User> userOptional = this.userRepository.findById(post.getUser().getId());
            post.setUser(userOptional.orElse(null));
        }
        Post currentPost = this.postRepository.save(post);

        ResCreatePostDTO dto = new ResCreatePostDTO();
        dto.setId(currentPost.getId());
        dto.setTitle(currentPost.getTitle());
        dto.setContent(currentPost.getContent());
        dto.setStartDate(currentPost.getStartDate());
        dto.setEndDate(currentPost.getEndDate());
        dto.setActive(currentPost.isActive());
        dto.setCreatedAt(currentPost.getCreatedAt());
        dto.setCreatedBy(currentPost.getCreatedBy());
        if (currentPost.getJob() != null) {
            dto.setJob(currentPost.getJob());
        }
        if (currentPost.getUser() != null) {
            dto.setUser(currentPost.getUser());
        }
        return dto;
    }

    public ResUpdatePostDTO update(Post post, Post postInDB) {
        postInDB.setTitle(post.getTitle());
        postInDB.setContent(post.getContent());
        postInDB.setStartDate(post.getStartDate());
        postInDB.setEndDate(post.getEndDate());
        postInDB.setActive(post.isActive());
        // update job
        if (post.getJob() != null) {
            Optional<Job> jobOptional = this.jobRepository.findById(post.getJob().getId());
            postInDB.setJob(jobOptional.get());
        }
        // update user
        if (post.getUser() != null) {
            Optional<User> userOptional = this.userRepository.findById(post.getUser().getId());
            postInDB.setUser(userOptional.get());
        }
        Post currentPost = this.postRepository.save(postInDB);

        ResUpdatePostDTO dto = new ResUpdatePostDTO();
        dto.setId(currentPost.getId());
        dto.setTitle(currentPost.getTitle());
        dto.setContent(currentPost.getContent());
        dto.setStartDate(currentPost.getStartDate());
        dto.setEndDate(currentPost.getEndDate());
        dto.setActive(currentPost.isActive());
        dto.setUpdatedAt(currentPost.getUpdatedAt());
        dto.setUpdatedBy(currentPost.getUpdatedBy());
        if (currentPost.getJob() != null) {
            ResUpdatePostDTO.JobDTO jobDTO = new ResUpdatePostDTO.JobDTO();
            jobDTO.setId(currentPost.getJob().getId());
            jobDTO.setName(currentPost.getJob().getName());
            jobDTO.setLocation(currentPost.getJob().getLocation());
            jobDTO.setSalary(currentPost.getJob().getSalary());
            jobDTO.setQuantity(currentPost.getJob().getQuantity());
            jobDTO.setLevel(currentPost.getJob().getLevel().toString());
            jobDTO.setDescription(currentPost.getJob().getDescription());
            dto.setJob(jobDTO);
        }
        if (currentPost.getUser() != null) {
            ResUpdatePostDTO.UserDTO userDTO = new ResUpdatePostDTO.UserDTO();
            userDTO.setId(currentPost.getUser().getId());
            userDTO.setName(currentPost.getUser().getName());
            userDTO.setEmail(currentPost.getUser().getEmail());
            dto.setUser(userDTO);
        }
        return dto;
    }

    public void delete(long id) {
        Optional<Post> postOptional = this.postRepository.findById(id);
        if (postOptional.isPresent()) {
            Post post = postOptional.get();
            if (post.getResumes() != null) {
                List<Resume> resumes = post.getResumes();
                this.resumeRepository.deleteAll(resumes);
            }
            this.postRepository.delete(post);
        }
    }

    public ResFetchPostDTO getPost(Post post) {
        ResFetchPostDTO dto = new ResFetchPostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setStartDate(post.getStartDate());
        dto.setEndDate(post.getEndDate());
        dto.setActive(post.isActive());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setCreatedBy(post.getCreatedBy());
        dto.setUpdatedBy(post.getUpdatedBy());

        // Set company name if job and company exist
        ResFetchPostDTO.CompanyPost company = null;
        if (post.getJob() != null && post.getJob().getCompany() != null) {
            company = new ResFetchPostDTO.CompanyPost(
                    post.getJob().getCompany().getId(),
                    post.getJob().getCompany().getName(),
                    post.getJob().getCompany().getLogo());

        }

        // Set user info if exists
        ResFetchPostDTO.UserPost jobUser = null;
        if (post.getUser() != null) {
            jobUser = new ResFetchPostDTO.UserPost(
                    post.getUser().getId(),
                    post.getUser().getName());

        }
        List<ResFetchPostDTO.SkillPost> jobSkills = null;
        // Set job info if exists
        if (post.getJob() != null) {
            Job job = post.getJob();
            jobSkills = job.getSkills().stream()
                    .map(skill -> new ResFetchPostDTO.SkillPost(skill.getId(), skill.getName()))
                    .collect(Collectors.toList());

        }

        ResFetchPostDTO.CompanyPost jobCompany = null;
        if (post.getJob() != null && post.getJob().getCompany() != null) {
            jobCompany = new ResFetchPostDTO.CompanyPost(
                    post.getJob().getCompany().getId(),
                    post.getJob().getCompany().getName(),
                    post.getJob().getCompany().getLogo());

        }

        dto.setJob(new ResFetchPostDTO.JobPost(
                post.getJob().getId(),
                post.getJob().getName(),
                post.getJob().getLocation(),
                post.getJob().getSalary(),
                post.getJob().getQuantity(),
                post.getJob().getLevel().toString(),
                post.getJob().getDescription(),
                jobSkills,
                jobUser,
                jobCompany));

        return dto;
    }

    public ResultPaginationDTO fetchAll(Specification<Post> spec, Pageable pageable) {
        Page<Post> pageUser = this.postRepository.findAll(spec, pageable);

        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pageUser.getTotalPages());
        mt.setTotal(pageUser.getTotalElements());

        rs.setMeta(mt);

        // Convert to DTOs
        List<ResFetchPostDTO> listPosts = pageUser.getContent()
                .stream().map(item -> this.getPost(item))
                .collect(Collectors.toList());

        rs.setResult(listPosts);

        return rs;
    }
}