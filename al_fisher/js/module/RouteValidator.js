import {ROUTE} from './Constants';
import {Logger} from './Logger';

export class RouteValidator {
    /**
     * Является ли URL целевым для модификации
     * @param url Проверяемый URL
     * @returns {boolean}
     */
    isTargetRoute(url) {
        return [ROUTE.USER_LOCATION, ROUTE.RELEASES].some(route =>
            this.hasTargetRoute(url, route)
        );
    }

    /**
     * Проверяет, соответствует ли URL целевому маршруту
     * @param {string} currentUrl Проверяемый URL
     * @param {string} targetRoute Целевой маршрут
     * @returns {boolean} true если URL соответствует маршруту
     */
    hasTargetRoute(currentUrl, targetRoute) {
        try {
            if (!currentUrl || !targetRoute) return false;
            return new URL(currentUrl, window.location.origin).pathname.startsWith(targetRoute);
        } catch (e) {
            Logger.error('Ошибка при проверке URL:', e);
            return false;
        }
    }
}