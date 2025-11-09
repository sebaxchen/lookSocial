import { bootstrapApplication } from '@angular/platform-browser';
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';

const firebaseApp = initializeApp(environment.firebase);

if (typeof window !== 'undefined' && environment.firebase?.measurementId) {
  void isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(firebaseApp);
      }
    })
    .catch((error) => {
      console.warn('Firebase Analytics is not supported in this environment.', error);
    });
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
