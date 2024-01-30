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

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { DataService } from './data.service';
import { AuthService } from './auth.service';
import { inject } from '@vercel/analytics';
inject();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  eulaAcceptance = true;
  initialized = false;
  constructor(public auth: AuthService, private dataService: DataService) {}
  ngOnInit() {
    this.initialized = true;
  }

  loading = false;
  hasData = this.dataService.loaded$;

  acceptEula() {
    this.eulaAcceptance = true;
    localStorage['EULA'] = 'accepted';
  }
  declineEula() {
    localStorage.removeItem('EULA');
    location.href = 'about:blank';
  }
  
}
