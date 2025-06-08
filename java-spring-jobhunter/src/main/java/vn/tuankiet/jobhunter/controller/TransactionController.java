package vn.tuankiet.jobhunter.controller;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import vn.tuankiet.jobhunter.domain.response.ResultPaginationDTO;
import vn.tuankiet.jobhunter.service.TransactionService;
import vn.tuankiet.jobhunter.util.annotation.ApiMessage;
import vn.tuankiet.jobhunter.util.error.IdInvalidException;

@RestController
@RequestMapping("/api/v1")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/transactions/by-user")
    @ApiMessage("Get list transactions by user")
    public ResponseEntity<ResultPaginationDTO> fetchTransactionsByUser(Pageable pageable) throws IdInvalidException {
        return ResponseEntity.ok().body(transactionService.fetchTransactionsByUser(pageable));
    }
} 