package vn.tuankiet.jobhunter.controller;

import java.util.Optional;
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
import jakarta.validation.Valid;
import vn.tuankiet.jobhunter.domain.Post;
import vn.tuankiet.jobhunter.domain.response.post.ResCreatePostDTO;
import vn.tuankiet.jobhunter.domain.response.post.ResUpdatePostDTO;
import vn.tuankiet.jobhunter.domain.response.post.ResFetchPostDTO;
import vn.tuankiet.jobhunter.service.PostService;
import vn.tuankiet.jobhunter.util.annotation.ApiMessage;
import vn.tuankiet.jobhunter.util.error.IdInvalidException;
import vn.tuankiet.jobhunter.domain.response.ResultPaginationDTO;

@RestController
@RequestMapping("/api/v1")
public class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping("/posts")
    @ApiMessage("Create a post")
    public ResponseEntity<ResCreatePostDTO> create(@Valid @RequestBody Post post) {
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
        return ResponseEntity.ok().body(this.postService.fetchAll(spec, pageable));
    }
}