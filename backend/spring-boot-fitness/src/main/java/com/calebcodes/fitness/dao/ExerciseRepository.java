package com.calebcodes.fitness.dao;

import com.calebcodes.fitness.entity.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.CrossOrigin;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
}
