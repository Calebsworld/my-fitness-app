import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Exercise } from 'src/app/common/Exercise';
import { WorkingSet } from 'src/app/common/WorkingSet';
import { Workout } from 'src/app/common/Workout';
import { WorkoutService } from 'src/app/services/workout.service';

@Component({
  selector: 'app-workout-detail',
  templateUrl: './workout-detail.component.html',
  styleUrls: ['./workout-detail.component.css']
})
export class WorkoutDetailComponent implements OnInit, OnDestroy {

  workoutId?:number
  workout$!: Observable<Workout>
  exercises$!: Observable<Exercise[]> 
  exerciseDeleteMessage?: string
  exerciseUpdateMessage?:string

  #unsubscribe$ = new Subject<void>()

  constructor(private workoutService:WorkoutService,
              private route:ActivatedRoute, 
              private router:Router) {}

  ngOnInit(): void {
    this.workoutId = +this.route.snapshot.paramMap.get('id')!
    
    this.route.queryParams.subscribe(
      params => {
        this.exerciseUpdateMessage = params['exerciseUpdateMessage']
    })
    if (!!this.workoutId) {
      this.showWorkoutDetails()
    }
    if (!!this.exerciseUpdateMessage) {
      this.showUpdateMessage()
    }
  }

  ngOnDestroy(): void {
    this.#unsubscribe$.next()
    this.#unsubscribe$.complete
  }

  showWorkoutDetails() {
      this.workout$ = this.workoutService.getWorkoutById(this.workoutId!)
      this.showExercises()
  }

  showExercises() {
    this.exercises$ = this.workoutService.getExercises(this.workoutId!)
  }

  removeExercise(exerciseId:number) {
    if (!!this.workoutId) {
      this.exerciseDeleteMessage = undefined
      this.workoutService.removeExerciseFromWorkout(this.workoutId, exerciseId).pipe(
        takeUntil(this.#unsubscribe$)
      ).subscribe(
        res => {
          if (res.status === 200) {
            console.log(res)
            this.exerciseDeleteMessage = res.message
            this.showDeleteMessage()
            this.showExercises()
          }
        }
      )
    }
  }

  showDeleteMessage() {
    if (this.exerciseDeleteMessage) {
      setTimeout(() => {
        this.exerciseDeleteMessage = undefined
      }, 2000)
    }
  }

  showUpdateMessage() {
    if (this.exerciseUpdateMessage) {
      setTimeout(() => {
        this.exerciseUpdateMessage = undefined
      }, 2000)
    }
  }


  addExercise(workout:Workout) {
    this.router.navigate([`/exercise/workout/${workout.id}`])
  }

  editExercise(workoutId:number, exerciseId:number) {
    this.router.navigate(['/workout', workoutId, 'exercises', exerciseId]);
}


  groupedSets(exercise:Exercise): {set: WorkingSet, count:number}[] {

    if (exercise.workingSet?.length === 0) return [];
    
    let output:{set: WorkingSet, count:number}[] = []
    let currentItem:WorkingSet | null = null
    let currentCount = 0

    for (let set of exercise.workingSet!) {
      if (currentItem === null || set.reps !== currentItem.reps || set.weight !== currentItem.weight) {
        if (currentItem !== null) {
          output.push({set: currentItem, count: currentCount})
        }
      currentItem = set
      currentCount = 1
      } else {
        currentCount++
      }
    }
    if (currentItem !== null) {
      output.push({set: currentItem, count: currentCount});
    }
    return output
  }


  


}
