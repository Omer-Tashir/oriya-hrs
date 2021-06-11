import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CompaniesComponent } from './companies/companies.component';
import { ArticlesComponent } from './articles/articles.component';
import { CandidatesComponent } from './candidates/candidates.component';
import { AuthService } from './auth/auth.service';
import { isAdminGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'companies', component: CompaniesComponent, canActivate: [isAdminGuard] },
  { path: 'candidates', component: CandidatesComponent },
  { path: 'articles', component: ArticlesComponent },
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
