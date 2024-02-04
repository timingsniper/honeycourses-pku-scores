// Copyright (C) 2022 Guyutongxue
//
// This file is part of pkuhelper-web-score.
//
// pkuhelper-web-score is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// pkuhelper-web-score is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with pkuhelper-web-score.  If not, see <http://www.gnu.org/licenses/>.

import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import {
  calcGpa,
  Course,
  courseGpaFromNormalizedScore,
  fix,
  guessScoreFromGpa,
  isFail,
  scoreTampered,
  Semester,
  sumCredit,
} from '../score_parser';
import { colorizeSemester } from "../colorize";
import { map, Subject, Subscription, switchMap, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { OptionsService } from '../options.service';

@UntilDestroy()
@Component({
  selector: 'app-semester-viewer',
  templateUrl: './semester-viewer.component.html',
  styleUrls: ['./semester-viewer.component.scss'],
})
export class SemesterViewerComponent {
  constructor(
    private options: OptionsService,
    private dataService: DataService) { }

  @Input() set sem(value: Semester) { this.#sem$.next(value); }
  #sem$ = new Subject<Semester>();

  private transformName(originalName: string): string { // 학년, 학기명 한국어로 변환
    const yearMatch = originalName.match(/(\d+)学年/);
    const termMatch = originalName.match(/第(\d+)学期/);
  
    if (yearMatch && termMatch) {
      const year = parseInt(yearMatch[1], 10);
      const term = termMatch[1];
      return `${year}-${year + 1}학년도 ${term}학기`;
    } else {
      return originalName;
    }
  }
  

  #subscription = this.#sem$.pipe(
    tap(sem => this.name = this.transformName(sem.name)),
    switchMap(sem => this.dataService.scores$.pipe(
      map(({ courses }) => [courses, sem.courseList] as [Course[], number[]])
    )),
    untilDestroyed(this)
  ).subscribe(([c, l]) => {
    this.credit = sumCredit(c, l);
    this.gpa = calcGpa(c, l);
    this.score = guessScoreFromGpa(this.gpa);
    this.tampered = scoreTampered(l.map(l => c[l]));
    this.courseList = l.sort((id1, id2) => {
      const s1 = courseGpaFromNormalizedScore(c[id1].score) ?? 0;
      const s2 = courseGpaFromNormalizedScore(c[id2].score) ?? 0;
      const f1 = Number(isFail(c[id1].score));
      const f2 = Number(isFail(c[id2].score));
      return s2 !== s1 ? s2 - s1 : f1 !== f2 ? f2 - f1 : id2 - id1;
    });
  })

  name = "";
  credit = 0;
  gpa: number | null = 0;
  score: number | string = '--.-';
  tampered = false;
  courseList: number[] = [];

  judgeByGpa$ = this.options.judgeByGpa$;

  colorizeSemester = colorizeSemester;
  fix = fix;
}
