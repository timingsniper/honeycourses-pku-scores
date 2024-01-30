// Copyright (C) 2024 Joonwoo Jang
//
// This file is part of honeycourses-pku-scores
//
// honeycourses-pku-scores is a free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// honeycourses-pku-scores is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with honeycourses-pku-scores.  If not, see <http://www.gnu.org/licenses/>.

import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { OptionsService } from '../options.service';

@Component({
  selector: 'app-controller',
  templateUrl: './controller.component.html',
  styleUrls: ['./controller.component.scss']
})
export class ControllerComponent implements OnInit {

  constructor(
    public auth: AuthService,
    private options: OptionsService
  ) { }

  ngOnInit(): void {
  }

  hideText$ = this.options.hideText$;
  judgeByGpa$ = this.options.judgeByGpa$;

  toggleHideText() {
    this.options.toggleHideText();
  }
  toggleJudgeByGpa() {
    this.options.toggleJudgeByGpa();
  }

  readonly INTERVAL = 300 * 1000;
  interval: NodeJS.Timeout | null = null;
  nextUpdateTime = 0;
  toggleAutoReload() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    } else {
      this.nextUpdateTime = Date.now() + this.INTERVAL;
      this.interval = setInterval(() => {
        this.auth.load();
        this.nextUpdateTime = Date.now() + this.INTERVAL;
      }, this.INTERVAL);
    }
  }
}
