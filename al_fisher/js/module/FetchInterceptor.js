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
     * @param {RequestInit} [requestOptions] Параметры запроса
     * @returns {Promise<Response>} Модифицированный ответ
     */
    async #handleResponse(response, requestUrl, requestOptions) {
        try {
            let data;
            if (this.#needProxyVideo(requestUrl, response)) {
                [response, data] = await this.#proxyVideoResponse(response, requestUrl, requestOptions);
            } else {
                data = await this.#handleRegularResponse(response, requestUrl, requestOptions);
            }
            this.#throwExceptionOnEmptyData(data);
            return this.#buildFinalResponse(response, data);
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
        Logger.info('Проксирование запроса видео...');
        const proxyResponse = await this.proxyService.fetchResponse(requestUrl, requestOptions);
        if (!DataValidator.isValidResponse(proxyResponse)) {
            Logger.warning('Некорректный ответ от сервера...');
            return [response, null];
        }
        const data = await this.proxyService.parseResponseData(proxyResponse);
        response = this.responseBuilder.transformResponse(proxyResponse, data);
        return [response, data];
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
            Logger.warning('Некорректный ответ от сервера...');
            return null;
        }
        let data = await response.json();
        if (this.proxyService.needProxy(data)) {
            Logger.warning('Запрос обработан, идет проксирование...');
            data = await this.proxyService.fetchData(requestUrl, requestOptions);
        }
        return data;
    }

    /**
     * Выбрасывает исключение, если данные пусты или отсутствуют
     * @param {Object|Array|null} data Данные для проверки
     * @throws {Error} Если данные не предоставлены
     */
    #throwExceptionOnEmptyData(data) {
        if (!data) {
            throw new Error('Данные для трансформации отсутствуют...');
        }
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