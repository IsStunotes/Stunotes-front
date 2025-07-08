import { Routes } from '@angular/router';

export const repositoryRoutes: Routes = [
  {
    path: 'list',
    loadComponent: () => import('../repository/repository-list.component')
      .then(m => m.RepositoryListComponent)
  },
  {
  path: 'repositories/:id',
  loadComponent: () => import('./repository-details/repository-detail.component')
    .then(m => m.RepositoryDetailComponent)
},
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
