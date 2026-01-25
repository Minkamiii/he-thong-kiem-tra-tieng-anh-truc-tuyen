package com.khanh.code.api_response;

import java.util.List;

public class Question {
    private String _id;
    private String type;

    //essay does not have keys
    private List<Integer> keys;
    private String key;

    public String get_id() {
        return _id;
    }
    public void set_id(String _id) {
        this._id = _id;
    }
    public String getType() {
        return type;
    }
    public void setType(String type) {
        this.type = type;
    }
    public List<Integer> getKeys() {
        return keys;
    }
    public void setKeys(List<Integer> keys) {
        this.keys = keys;
    }
    public String getKey() {
        return key;
    }
    public void setKey(String key) {
        this.key = key;
    }
}
