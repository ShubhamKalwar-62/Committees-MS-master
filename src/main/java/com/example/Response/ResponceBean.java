package com.example.Response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponceBean<T> {
    
    private boolean success;
    private String message;
    private T data;
    private String error;
    private long timestamp;
    
    public ResponceBean() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public ResponceBean(boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }
    
    public ResponceBean(boolean success, String message, T data) {
        this();
        this.success = success;
        this.message = message;
        this.data = data;
    }
    
    // Static factory methods for common responses
    public static <T> ResponceBean<T> success(String message, T data) {
        return new ResponceBean<>(true, message, data);
    }
    
    public static <T> ResponceBean<T> success(String message) {
        return new ResponceBean<>(true, message);
    }
    
    public static <T> ResponceBean<T> error(String errorMessage) {
        ResponceBean<T> response = new ResponceBean<>(false, "Error occurred");
        response.setError(errorMessage);
        return response;
    }
    
    public static <T> ResponceBean<T> error(String message, String errorDetails) {
        ResponceBean<T> response = new ResponceBean<>(false, message);
        response.setError(errorDetails);
        return response;
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public T getData() {
        return data;
    }
    
    public void setData(T data) {
        this.data = data;
    }
    
    public String getError() {
        return error;
    }
    
    public void setError(String error) {
        this.error = error;
    }
    
    public long getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
