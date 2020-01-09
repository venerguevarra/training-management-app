import { Component, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LayoutService } from '../services/layout.service';
import { ConfigService } from '../services/config.service';
import { AuthService } from '../auth/auth.service';
import { Router, ActivatedRoute } from "@angular/router";
import { StateService } from '../../service/state.service';
import { EventService } from '../../service/event.service';
import { User } from '../../model/user.model';

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"]
})
export class NavbarComponent implements OnInit, AfterViewInit {
  currentLang = "en";
  toggleClass = "ft-maximize";
  placement = "bottom-right";
  public isCollapsed = true;
  @Output()
  toggleHideSidebar = new EventEmitter<Object>();

  public config: any = {};

  user: any = {};

  constructor(
    public translate: TranslateService,
    private eventService: EventService,
    private layoutService: LayoutService,
    private configService:ConfigService,
    private router: Router,
    private authService: AuthService,
    private stateService: StateService) {

    const browserLang: string = translate.getBrowserLang();
    translate.use(browserLang.match(/en|es|pt|de/) ? browserLang : "en");

    this.user = this.stateService.getCurrentUser();
  }

  ngOnInit() {
    this.config = this.configService.templateConf;
    this.eventService.emitter.subscribe((data) => {
      if(data.eventType === 'profile-updated') {
        this.user = this.stateService.getCurrentUser();
      }
    });
  }

  ngAfterViewInit() {
    if(this.config.layout.dir) {
      const dir = this.config.layout.dir;
        if (dir === "rtl") {
          this.placement = "bottom-left";
        } else if (dir === "ltr") {
          this.placement = "bottom-right";
        }
    }
  }


  ChangeLanguage(language: string) {
    this.translate.use(language);
  }

  ToggleClass() {
    if (this.toggleClass === "ft-maximize") {
      this.toggleClass = "ft-minimize";
    } else {
      this.toggleClass = "ft-maximize";
    }
  }


  toggleSidebar() {
    const appSidebar = document.getElementsByClassName("app-sidebar")[0];
    if (appSidebar.classList.contains("hide-sidebar")) {
      this.toggleHideSidebar.emit(false);
    } else {
      this.toggleHideSidebar.emit(true);
    }
  }

  logout() {
     this.authService.logout();
     this.router.navigate(['/login']);
  }
}
