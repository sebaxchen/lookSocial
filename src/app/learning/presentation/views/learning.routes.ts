import {Routes} from '@angular/router';

const categoryList = () =>
  import('./category-list/category-list').then(m => m.CategoryList);

const baseTitle = 'NoteTo';

export const learningRoutes: Routes = [
  { path: 'collaborators', loadComponent: categoryList, title: `${baseTitle} - Colaboradores`},
  { path: 'categories', redirectTo: 'collaborators', pathMatch: 'full' },
];
