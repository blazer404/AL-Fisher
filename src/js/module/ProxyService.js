import {FAKE_USER_AGENT, MESSAGE_LIB, PROXY_API_URL} from './Constants';
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
            Logger.info(MESSAGE_LIB.PROXY_RUNNING, '', true);
            const response = await this.fetchResponse(requestUrl, requestOptions);
            const data = await this.parseResponseData(response);
            Logger.info(MESSAGE_LIB.PROXY_FINISHED, '', true);
            return data;
        } catch (e) {
            Logger.warning(MESSAGE_LIB.PROXY_FAILED);
            return null;
        }
    }

    /**
     * Проксирует данные по указанному URL
     * @async
     * @param {string|Request} requestUrl URL запроса
     * @param {Object} [requestOptions] Параметры запроса
     * @returns {Promise<*>} Проксированный ответ
     */
    async fetchResponse(requestUrl, requestOptions) {
        requestUrl = `${this.proxyApiUrl}${window.location.origin}${requestUrl}`;
        requestOptions.headers = this.#setRequestHeaders(requestOptions.headers);
        return await this.originalFetch(requestUrl, requestOptions)
    }

    /**
     * Устанавливает новые заголовки запроса
     * @param originalHeaders Оригинальные заголовки
     * @returns {Headers}
     */
    #setRequestHeaders(originalHeaders) {
        const headers = new Headers(originalHeaders || {});
        headers.set('User-Agent', FAKE_USER_AGENT);
        headers.delete('content-length');
        return headers;
    }

    /**
     * Разобрать проксированный ответ
     * @param response
     * @returns {Promise<any|null>}
     */
    async parseResponseData(response) {
        const data = await response.json();
        return data.contents ? JSON.parse(data.contents) : null;
    }
}