import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { AuthService } from './auth/auth.service';
import { AboutComponent } from './about/about.component';
import { GalleryComponent } from './gallery/gallery.component';
import { FaqComponent } from './faq/faq.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { VolunteerComponent } from './volunteer/volunteer.component';
import { ReferANeedyComponent } from './refer-a-needy/refer-a-needy.component';
import { JoinUsComponent } from './join-us/join-us.component';

// Admin Panel
import { AdminComponent } from './admin/admin.component';
import { ViewUpdateVolunteersComponent } from './view-update-volunteers/view-update-volunteers.component';

// Volunteer Panel
import { VolunteerAdminPanelComponent } from './volunteer-admin-panel/volunteer-admin-panel.component';
import { VolunteerAddShiftsComponent } from './volunteer-add-shifts/volunteer-add-shifts.component';
import { VolunteerEditShiftsComponent } from './volunteer-edit-shifts/volunteer-edit-shifts.component';

import { isAdminGuard, isVolunteerGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'gallery', component: GalleryComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'faq', component: FaqComponent },
  { path: 'volunteer', component: VolunteerComponent },
  { path: 'volunteer-admin-panel', component: VolunteerAdminPanelComponent, canActivate: [isVolunteerGuard] },
  { path: 'volunteer-add-shifts', component: VolunteerAddShiftsComponent, canActivate: [isVolunteerGuard]  },
  { path: 'volunteer-edit-shifts', component: VolunteerEditShiftsComponent, canActivate: [isVolunteerGuard]  },
  { path: 'refer-a-needy', component: ReferANeedyComponent },
  { path: 'join-us', component: JoinUsComponent },

  // admin section
  { path: 'admin', component: AdminComponent, canActivate: [isAdminGuard] },
  { path: 'view-update-volunteers', component: ViewUpdateVolunteersComponent, canActivate: [isAdminGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(private router: Router, private authService: AuthService) {
    this.router.errorHandler = (error: any) => {
      this.authService.logout(error);
    };
  }
}
