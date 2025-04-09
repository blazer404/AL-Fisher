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
     * @param {RequestInit} [options] Параметры запроса
     * @returns {Promise<Response>} Обработанный ответ
     */
    async #fetchHandler(url, options) {
        try {
            let response = await this.originalFetch(url, options);
            if (this.routeValidator.needInterceptRequest(url)) {
                response = await this.#handleResponse(response, url, options);
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
     * @param {RequestInit} [requestOptions] Параметры запроса
     * @returns {Promise<Response>} Модифицированный ответ
     */
    async #handleResponse(response, requestUrl, requestOptions) {
        try {
            Logger.info('Модификация ответа для', requestUrl);
            let data;
            if (this.#needProxyVideo(requestUrl, response)) {
                [response, data] = await this.#proxyVideoResponse(response, requestUrl, requestOptions);
            } else {
                data = await this.#handleRegularResponse(response, requestUrl, requestOptions);
            }
            if (data) {
                response = await this.#buildFinalResponse(response, data);
                Logger.info('Ответ модифицирован для', requestUrl);
            } else {
                Logger.info('Ответ не был модифицирован для', requestUrl);
            }
            return response;
        } catch (e) {
            Logger.error('Ошибка модификации ответа:', e);
            return response;
        }
    }

    /**
     * Нужно ли проксировать запрос к видео
     * @param {string|Request} requestUrl URL запроса
     * @param {Response} response Оригинальный ответ сервера
     * @returns {boolean}
     */
    #needProxyVideo(requestUrl, response) {
        return this.routeValidator.isVideoRoute(requestUrl) && !DataValidator.isValidResponse(response);
    }

    /**
     * Проксирование запроса к видео
     * @async
     * @param {Response} response Оригинальный ответ
     * @param {string|Request} requestUrl URL запроса
     * @param {RequestInit} [requestOptions] Параметры запроса
     * @returns {Promise<(Response|*)[]|*[]>} Модифицированный ответ и данные для трансформации
     */
    async #proxyVideoResponse(response, requestUrl, requestOptions) {
        try {
            Logger.info('Идет проксирование видео-запроса', '', true);
            const proxyResponse = await this.proxyService.fetchResponse(requestUrl, requestOptions);
            const data = await this.proxyService.parseResponseData(proxyResponse);
            response = this.responseBuilder.transformResponse(proxyResponse, data);
            Logger.info('Проксирование завершено', '', true);
            return [response, data];
        } catch (e) {
            Logger.warning('Проксирование не удалось');
            return [response, null];
        }
    }

    /**
     * Стандартная обработка ответа
     * @async
     * @param {Response} response Оригинальный ответ
     * @param {string|Request} requestUrl URL запроса
     * @param {RequestInit} [requestOptions] Параметры запроса
     * @returns {Promise<*|null>} Данные для трансформации
     */
    async #handleRegularResponse(response, requestUrl, requestOptions) {
        if (!DataValidator.isValidResponse(response)) {
            Logger.warning('Некорректный ответ от сервера');
            return null;
        }
        let data = await response.json();
        if (this.proxyService.needProxy(data)) {
            const proxiedData = await this.proxyService.fetchData(requestUrl, requestOptions);
            if (proxiedData) {
                data = proxiedData;
            }
        }
        return data;
    }

    /**
     * Сборка конечного модифицированного ответа
     * @param {Response} response Оригинальный ответ
     * @param {Object|Array} data Оригинальные данные
     * @returns {Response} Модифицированный ответ
     */
    #buildFinalResponse(response, data) {
        const transformedData = this.dataTransformer.transformData(response.url, data);
        return this.responseBuilder.transformResponse(response, transformedData);
    }
}