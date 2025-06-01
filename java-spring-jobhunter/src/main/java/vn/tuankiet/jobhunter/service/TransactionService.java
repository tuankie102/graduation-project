package vn.tuankiet.jobhunter.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.tuankiet.jobhunter.domain.Transaction;
import vn.tuankiet.jobhunter.domain.User;
import vn.tuankiet.jobhunter.repository.TransactionRepository;
import vn.tuankiet.jobhunter.repository.UserRepository;
import vn.tuankiet.jobhunter.util.constant.PaymentStatusEnum;
import vn.tuankiet.jobhunter.util.constant.TransactionTypeEnum;
import vn.tuankiet.jobhunter.util.error.BalanceException;

import java.util.UUID;

@Service
public class TransactionService {

    @Value("${tuankiet.fee.apply}")
    private double applyFee;

    @Value("${tuankiet.fee.create-post}")
    private double createPostFee;

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public TransactionService(UserRepository userRepository, TransactionRepository transactionRepository) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    public void handleApplyFee(User user) {
        if (user.getBalance() < applyFee) {
            throw new BalanceException("Số dư không đủ để ứng tuyển. Vui lòng nạp thêm tiền.");
        }

        // Tạo transaction ghi nhận phí
        Transaction transaction = new Transaction();
        transaction.setPaymentRef(UUID.randomUUID().toString().replace("-", ""));
        transaction.setAmount(applyFee);
        transaction.setPaymentStatus(PaymentStatusEnum.SUCCESS);
        transaction.setTransactionType(TransactionTypeEnum.APPLY_FEE);
        transaction.setUser(user);

        // Trừ tiền từ tài khoản
        user.setBalance(user.getBalance() - applyFee);
        
        // Lưu transaction và cập nhật user
        transactionRepository.save(transaction);
        userRepository.save(user);
    }

    public void handleCreatePostFee(User user) {
        if (user.getBalance() < createPostFee) {
            throw new BalanceException("Số dư không đủ để đăng bài. Vui lòng nạp thêm tiền.");
        }

        // Tạo transaction ghi nhận phí
        Transaction transaction = new Transaction();
        transaction.setPaymentRef(UUID.randomUUID().toString().replace("-", ""));
        transaction.setAmount(createPostFee);
        transaction.setPaymentStatus(PaymentStatusEnum.SUCCESS);
        transaction.setTransactionType(TransactionTypeEnum.POST_FEE);
        transaction.setUser(user);

        // Trừ tiền từ tài khoản
        user.setBalance(user.getBalance() - createPostFee);
        
        // Lưu transaction và cập nhật user
        transactionRepository.save(transaction);
        userRepository.save(user);
    }
} 