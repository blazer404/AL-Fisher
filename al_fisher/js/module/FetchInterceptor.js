import {RouteValidator} from './RouteValidator';
import {DataModifier} from './DataModifier';
import {ResponseBuilder} from './ResponseBuilder';
import {ProxyService} from './ProxyService';
import {Logger} from './Logger';
import {DataValidator} from "./DataValidator";

export class FetchInterceptor {
    constructor() {
        this.ORIGINAL_FETCH = window.fetch.bind(window);
        this.routeValidator = new RouteValidator();
        this.dataModifier = new DataModifier();
        this.responseBuilder = new ResponseBuilder();
        this.proxyService = new ProxyService(this.ORIGINAL_FETCH);
    }

    /**
     * Подменяет оригинальный fetch-обработчик на модифицированный
     * @returns {void}
     */
    patchFetch() {
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
            let response = await this.ORIGINAL_FETCH(url, options);
            if (this.routeValidator.isTargetRoute(url)) {
                Logger.info('Модифицирую ответ для', url);
                response = await this.#handleResponse(response, url, options);
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
    async #handleResponse(response, requestUrl, requestOptions) {
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
            const modifiedData = this.dataModifier.modifyData(response.url, data);
            return this.responseBuilder.createModifiedResponse(response, modifiedData);
        } catch (e) {
            Logger.error('Ошибка модификации ответа:', e);
            return response;
        }
    }
}