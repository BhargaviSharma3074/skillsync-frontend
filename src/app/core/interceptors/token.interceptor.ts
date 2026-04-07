// import { HttpInterceptorFn } from '@angular/common/http';

// export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
//   // Auth endpoints are public — no token needed
//   if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
//     return next(req);
//   }

//   const token = sessionStorage.getItem('access_token');
//   if (token) {
//     req = req.clone({
//       setHeaders: { Authorization: `Bearer ${token}` }
//     });
//   }
//   return next(req);
// };


import { HttpInterceptorFn } from '@angular/common/http';
import { isTokenExpired } from '../auth/jwt.util';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  // Auth endpoints are public — no token needed
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // ← localStorage instead of sessionStorage
  const token = localStorage.getItem('access_token');

  // If token exists and is not expired, attach it
  if (token && !isTokenExpired(token)) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  } else if (token && isTokenExpired(token)) {
    // Token expired — clean up localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  return next(req);
};