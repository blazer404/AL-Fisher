import {PROXY_API_URL} from './Constants';
import {DataValidator} from './DataValidator';
import {Logger} from './Logger';

export class ProxyService {
    constructor(originalFetch) {
        this.originalFetch = originalFetch;
        this.proxyApiUrl = PROXY_API_URL;
    }

    /**
     * Необходимо ли проксировать данные (потому что они не валидны)
     * @param {Object} data Проверяемые данные
     * @returns {boolean}
     */
    needProxy(data) {
        return DataValidator.isValidData(data)
            && data.episodes_total
            && Array.isArray(data.episodes)
            && !data.episodes?.length;
    }

    /**
     * Получить проксированные данные
     * @async
     * @param {string|Request} requestUrl URL запроса
     * @param {Object} [requestOptions] Параметры запроса
     * @returns {Promise<any|null>} Проксированные данные
     */
    async fetchData(requestUrl, requestOptions) {
        try {
            const response = await this.#fetchResponse(requestUrl, requestOptions);
            const data = await response.json();
            return data.contents ? JSON.parse(data.contents) : null;
        } catch (e) {
            Logger.warning('Проксирование не удалось...');
            return null;
        }
    }

    /**
     * Проксирует данные по указанному URL
     * @async
     * @param {string|Request} url URL запроса
     * @param {Object} [options] Параметры запроса
     * @returns {Promise<*>} Проксированный ответ
     */
    async #fetchResponse(url, options) {
        url = `${this.proxyApiUrl}${window.location.origin}${url}`;
        return await this.originalFetch(url, options);
    }
}