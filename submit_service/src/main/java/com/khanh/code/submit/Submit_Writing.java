package com.khanh.code.submit;

import java.util.Date;
import java.util.List;

import jakarta.persistence.Entity;

@Entity
public class Submit_Writing extends Submit {

    public Submit_Writing() {}

    public Submit_Writing(String id_user, String id_test,Type type,List<Integer>tasks, Date submit_day) {
        super(id_user, id_test, submit_day,type,tasks);
    }
}
