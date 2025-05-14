package vn.tuankiet.jobhunter.util.error;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import vn.tuankiet.jobhunter.domain.RestResponse;

@RestControllerAdvice
public class GlobalException {

    @ExceptionHandler(value = IdInvalidException.class)
    public ResponseEntity<RestResponse<Object>> handleIdException(IdInvalidException idInvalidException) {

        RestResponse<Object> res = new RestResponse<Object>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setError(idInvalidException.getMessage());
        res.setMessage("IdInValidException");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<RestResponse<Object>> handleArgNotValidException(MethodArgumentNotValidException ex) {
        BindingResult result = ex.getBindingResult();
        List<FieldError> fieldErrors = result.getFieldErrors();
        List<String> errors = new ArrayList<>();
        for (FieldError error : fieldErrors) {
            errors.add(error.getDefaultMessage());
        }

        RestResponse<Object> res = new RestResponse<Object>();
        res.setStatusCode(HttpStatus.BAD_REQUEST.value());
        res.setError(ex.getBody().getDetail());
        res.setMessage(errors.size() > 1 ? errors : errors.get(0));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }

}
