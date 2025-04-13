import {MESSAGE_LIB, ROUTE} from './Constants';
import {Logger} from './Logger';

export class RouteValidator {
    /**
     * Является ли URL целевым для модификации
     * @param {string} url Проверяемый URL
     * @returns {boolean}
     */
    needInterceptRequest(url) {
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
            Logger.error(MESSAGE_LIB.URL_CHECK_ERROR, e);
            return false;
        }
    }

    /**
     * Является ли URL маршрутом видео
     * @param {string} url Проверяемый URL
     * @returns {boolean}
     */
    isVideoRoute(url) {
        const pattern = new RegExp(`${ROUTE.EPISODES}([a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+)`);
        const match = url.match(pattern);
        return Array.isArray(match) && match[0] === url;
    }
}