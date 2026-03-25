package com.gs.mutualfundcalc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class MutualfundcalcApplication {
  public static void main(String[] args) {
    SpringApplication.run(MutualfundcalcApplication.class, args);
  }
}