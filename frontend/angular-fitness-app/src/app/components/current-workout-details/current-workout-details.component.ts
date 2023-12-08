import { Component, Input } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Exercise } from 'src/app/common/Exercise';
import { WorkingSet } from 'src/app/common/WorkingSet';
import { Workout } from 'src/app/common/Workout';
import { WorkoutService } from 'src/app/services/workout.service';

@Component({
  selector: 'app-current-workout-details',
  templateUrl: './current-workout-details.component.html',
  styleUrls: ['./current-workout-details.component.css'],
})
export class CurrentWorkoutDetailsComponent {
  @Input() workoutId?: number;
  workout$!: Observable<Workout>;
  exercises$!: Observable<Exercise[]>;

  private destroy$ = new Subject<void>();

  constructor(private workoutService: WorkoutService) {}

  ngOnInit() {
    console.log('in current workout details');
    if (!!this.workoutId) {
      this.showWorkoutDetails();
    }

    this.workoutService.workoutChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((changedWorkoutId) => {
        if (this.workoutId === changedWorkoutId) {
          this.showWorkoutDetails();
        }
      });
  }

  showWorkoutDetails() {
    // grab a workout that belongs to a user. I need to pass the user id and the workout id
    this.workout$ = this.workoutService.getWorkoutById(this.workoutId!);
    this.showExercises();
  }

  showExercises() {
    // grab all the exercises from a specific workout
    this.exercises$ = this.workoutService.getExercises(this.workoutId!);
  }

  groupedSets(exercise: Exercise): { set: WorkingSet; count: number }[] {
    if (exercise.workingSet?.length === 0) return [];

    let output: { set: WorkingSet; count: number }[] = [];
    let currentItem: WorkingSet | null = null;
    let currentCount = 0;

    for (let set of exercise.workingSet!) {
      if (
        currentItem === null ||
        set.reps !== currentItem.reps ||
        set.weight !== currentItem.weight
      ) {
        if (currentItem !== null) {
          output.push({ set: currentItem, count: currentCount });
        }
        currentItem = set;
        currentCount = 1;
      } else {
        currentCount++;
      }
    }
    if (currentItem !== null) {
      output.push({ set: currentItem, count: currentCount });
    }
    return output;
  }
}