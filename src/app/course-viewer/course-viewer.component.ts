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

import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BehaviorSubject, switchMap } from 'rxjs';
import { makeScoreGradient } from '../colorize';
import { DataService } from '../data.service';
import { OptionsService } from '../options.service';
import {
  Course,
  courseGpaFromNormalizedScore,
  describe,
  fix,
  isFull,
  scoreTampered,
} from '../score_parser';

@UntilDestroy()
@Component({
  selector: 'app-course-viewer',
  templateUrl: './course-viewer.component.html',
  styleUrls: ['./course-viewer.component.scss'],
})
export class CourseViewerComponent {
  constructor(
    private options: OptionsService,
    private dataService: DataService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  @Input() set index(value: number) {
    this.#index$.next(value);
  }
  #index$ = new BehaviorSubject<number>(-1);

  #subscription = this.#index$
    .pipe(
      switchMap((idx) => this.dataService.course$(idx)),
      untilDestroyed(this)
    )
    .subscribe((course) => {
      this.id = course.id;
      this.name = course.name;
      this.details = course.details;
      this.teacher = course.firstTeacher;
      this.semester = `20${course.year}-${course.year + 1}${course.semester}`;
      this.credit = course.credit;
      this.score = course.score;
      this.tampered = scoreTampered([course]);
      this.gpa = courseGpaFromNormalizedScore(course.score);
      const extraEle = this.document.createElement('p');
      for (const [k, n] of course.extras) {
        const keyEle = this.document.createElement('strong');
        keyEle.innerText = k + '：';
        extraEle.appendChild(keyEle);
        extraEle.appendChild(n.cloneNode(true));
        extraEle.appendChild(this.document.createElement('br'));
      }
      this.extras = extraEle;
    });

  id = '';
  name = '';
  details = '';
  teacher = '';
  semester = '';
  credit = 0;
  score: string | number = 0;
  tampered = false;
  gpa: number | null = null;
  extras: Element = undefined!;

  tamper(val: string) {
    this.dataService.tamper(this.#index$.value, val);
  }
  untamper() {
    this.dataService.untamper(this.#index$.value);
  }

  gotoPinzhi() {
    const params = new URLSearchParams({
      course: this.id,
      course_name: this.name,
      term: this.semester,
      teacher: this.teacher,
      score: String(this.score),
      platform: 'new_web_score',
    });
    const url = `https://courses.pinzhixiaoyuan.com/reviews/post_external?${params}`;
    console.log(url);
    window.open(url, '_blank');
  }

  judgeByGpa$ = this.options.judgeByGpa$;

  fix = fix;
  describe = describe;
  makeScoreGradient = makeScoreGradient;
  isFull = isFull;
}
