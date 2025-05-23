package vn.tuankiet.jobhunter.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import vn.tuankiet.jobhunter.domain.Post;
import vn.tuankiet.jobhunter.domain.Resume;
import vn.tuankiet.jobhunter.domain.User;
import vn.tuankiet.jobhunter.domain.response.ResultPaginationDTO;
import vn.tuankiet.jobhunter.domain.response.resume.ResCreateResumeDTO;
import vn.tuankiet.jobhunter.domain.response.resume.ResFetchResumeDTO;
import vn.tuankiet.jobhunter.domain.response.resume.ResUpdateResumeDTO;
import vn.tuankiet.jobhunter.repository.PostRepository;
import vn.tuankiet.jobhunter.repository.ResumeRepository;
import vn.tuankiet.jobhunter.repository.UserRepository;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public ResumeService(
            ResumeRepository resumeRepository,
            UserRepository userRepository,
            PostRepository postRepository) {
        this.resumeRepository = resumeRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    public Optional<Resume> fetchById(long id) {
        return this.resumeRepository.findById(id);
    }

    public boolean checkResumeExistByUserAndPost(Resume resume) {

        if (resume.getPost() == null)
            return false;
        Post post = resume.getPost();
        if (resume.getUser() == null)
            return false;
        Optional<User> userOptional = this.userRepository.findById(resume.getUser().getId());
        if (userOptional.isEmpty())
            return false;

        // check post by id
        Optional<Post> postOptional = this.postRepository.findById(post.getId());
        if (postOptional.isEmpty())
            return false;

        return true;
    }

    public ResCreateResumeDTO create(Resume resume) {
        resume = this.resumeRepository.save(resume);

        ResCreateResumeDTO res = new ResCreateResumeDTO();
        res.setId(resume.getId());
        res.setCreatedBy(resume.getCreatedBy());
        res.setCreatedAt(resume.getCreatedAt());

        return res;
    }

    public ResUpdateResumeDTO update(Resume resume) {
        resume = this.resumeRepository.save(resume);
        ResUpdateResumeDTO res = new ResUpdateResumeDTO();
        res.setUpdatedAt(resume.getUpdatedAt());
        res.setUpdatedBy(resume.getUpdatedBy());
        return res;
    }

    public void delete(long id) {
        this.resumeRepository.deleteById(id);
    }

    public ResFetchResumeDTO getResume(Resume resume) {
        ResFetchResumeDTO res = new ResFetchResumeDTO();
        res.setId(resume.getId());
        res.setEmail(resume.getEmail());
        res.setUrl(resume.getUrl());
        res.setStatus(resume.getStatus());
        res.setCreatedAt(resume.getCreatedAt());
        res.setCreatedBy(resume.getCreatedBy());
        res.setUpdatedAt(resume.getUpdatedAt());
        res.setUpdatedBy(resume.getUpdatedBy());

        if (resume.getPost() != null) {
            res.setCompanyName(resume.getPost().getJob() != null && resume.getPost().getJob().getCompany() != null
                    ? resume.getPost().getJob().getCompany().getName()
                    : null);
        }

        User user = resume.getPost() != null ? resume.getPost().getUser() : null;
        res.setUser(new ResFetchResumeDTO.UserResume(user != null ? user.getId() : 0,
                user != null ? user.getName() : null));
        res.setJob(new ResFetchResumeDTO.JobResume(resume.getPost() != null ? resume.getPost().getId() : 0,
                resume.getPost() != null ? resume.getPost().getTitle() : null));

        return res;
    }

    public ResultPaginationDTO fetchAllResume(Specification<Resume> spec, Pageable pageable) {
        Page<Resume> pageUser = this.resumeRepository.findAll(spec, pageable);
        ResultPaginationDTO rs = new ResultPaginationDTO();
        ResultPaginationDTO.Meta mt = new ResultPaginationDTO.Meta();

        mt.setPage(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());

        mt.setPages(pageUser.getTotalPages());
        mt.setTotal(pageUser.getTotalElements());

        rs.setMeta(mt);

        // remove sensitive data
        List<ResFetchResumeDTO> listResume = pageUser.getContent()
                .stream().map(item -> this.getResume(item))
                .collect(Collectors.toList());

        rs.setResult(listResume);

        return rs;
    }

    // Public method for controller
    public boolean checkResumeExistByPost(Resume resume) {
        return checkResumeExistByUserAndPost(resume);
    }
}
