import {DataTransformer} from './DataTransformer';
import {DataValidator} from './DataValidator';
import {Logger} from './Logger';
import {ProxyService} from './ProxyService';
import {ResponseBuilder} from './ResponseBuilder';
import {RouteValidator} from './RouteValidator';

export class FetchInterceptor {
    constructor() {
        this.originalFetch = window.fetch.bind(window);
        this.routeValidator = new RouteValidator();
        this.dataTransformer = new DataTransformer();
        this.responseBuilder = new ResponseBuilder();
        this.proxyService = new ProxyService(this.originalFetch);
    }

    /**
     * Включает перехват fetch запросов
     * @returns {void}
     */
    enableInterception() {
        window.fetch = async (url, options) => this.#fetchHandler(url, options);
    }

    /**
     * Обработчик fetch запросов
     * @async
     * @param {string|Request} url URL запроса
     * @param {Object} [options] Параметры запроса
     * @returns {Promise<Response>} Обработанный ответ
     */
    async #fetchHandler(url, options) {
        try {
            let response = await this.originalFetch(url, options);
            if (this.routeValidator.needInterceptRequest(url)) {
                Logger.info('Модифицирую ответ для', url);
                response = await this.#transformResponse(response, url, options);
                Logger.info('Ответ модифицирован для', url);
            }
            return response;
        } catch (e) {
            Logger.error('Ошибка при обработке запроса:', e);
            throw e;
        }
    }

    /**
     * Обрабатывает и модифицирует ответ сервера
     * @async
     * @param {Response} response Оригинальный ответ
     * @param {string|Request} requestUrl URL запроса
     * @param {Object} [requestOptions] Параметры запроса
     * @returns {Promise<Response>} Модифицированный ответ
     */
    async #transformResponse(response, requestUrl, requestOptions) {
        try {
            if (!DataValidator.isValidResponse(response)) {
                Logger.warning('Некорректный ответ от сервера...');
                return response;
            }
            let data = await response.json();
            if (this.proxyService.needProxy(data)) {
                Logger.warning('Запрос обработан, идет проксирование...');
                data = (await this.proxyService.fetchData(requestUrl, requestOptions)) || data;
            }
            const modifiedData = this.dataTransformer.transformData(response.url, data);
            return this.responseBuilder.createModifiedResponse(response, modifiedData);
        } catch (e) {
            Logger.error('Ошибка модификации ответа:', e);
            return response;
        }
    }
}