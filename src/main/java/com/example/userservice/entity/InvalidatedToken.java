package com.example.userservice.entity;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "invalidated_tokens")
public class InvalidatedToken {
    @Id
    private String id;
    Date expirytime;
    
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public Date getExpirytime() {
        return expirytime;
    }
    public void setExpirytime(Date expirytime) {
        this.expirytime = expirytime;
    }

    
}
