package com.example.userservice.entity;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "invalidated_tokens")
public class InvalidatedToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String idToken;
    
    public String getIdToken() {
        return idToken;
    }
    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }
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
