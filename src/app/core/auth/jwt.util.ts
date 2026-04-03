import { JwtPayload } from './auth.model';

export function decodeJwt(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonStr = decodeURIComponent(
            atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join('')
        );
        return JSON.parse(jsonStr) as JwtPayload;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeJwt(token);
    if (!payload) return true;
    return payload.exp < Math.floor(Date.now() / 1000);
}