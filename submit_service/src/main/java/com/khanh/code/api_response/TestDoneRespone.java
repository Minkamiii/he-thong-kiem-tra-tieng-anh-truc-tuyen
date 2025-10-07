package com.khanh.code.api_response;

public class TestDoneRespone {

    private String id_test;
    private int number_of_user_done;
    private boolean this_user_done_before;

    public TestDoneRespone(String id_test, int userDone, boolean isDone) {
        this.id_test = id_test;
        this.number_of_user_done = userDone;
        this.this_user_done_before= isDone;
    }
    
    public String getId_test() {
        return id_test;
    }
    public void setId_test(String id_test) {
        this.id_test = id_test;
    }

    public int getNumber_of_user_done() {
        return number_of_user_done;
    }

    public void setNumber_of_user_done(int number_of_user_done) {
        this.number_of_user_done = number_of_user_done;
    }

    public boolean isThis_user_done_before() {
        return this_user_done_before;
    }

    public void setThis_user_done_before(boolean this_user_done_before) {
        this.this_user_done_before = this_user_done_before;
    }
    
}
