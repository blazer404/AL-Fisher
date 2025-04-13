import {FAKE_USER_LOCATION, MESSAGE_LIB, ROUTE} from './Constants';
import {DataValidator} from './DataValidator';
import {Logger} from './Logger';
import {RouteValidator} from './RouteValidator';

export class DataTransformer {
    constructor() {
        this.routeValidator = new RouteValidator();
    }

    /**
     * Модифицирует JSON данные в зависимости от URL
     * @param {string} url URL запроса
     * @param {Object|Array} data Данные для модификации
     * @returns {Object|Array} Модифицированные данные
     */
    transformData(url, data) {
        if (!DataValidator.isValidData(data)) {
            Logger.warning(MESSAGE_LIB.WRONG_DATA);
            return data;
        }
        switch (true) {
            case this.routeValidator.hasTargetRoute(url, ROUTE.USER_LOCATION):
                return this.#setFakeUserLocation(data);
            case this.routeValidator.hasTargetRoute(url, ROUTE.RELEASES_LATEST):
            case this.routeValidator.hasTargetRoute(url, ROUTE.RELEASES_RANDOM):
                return this.#removeGeoAndCopyrightBlockEach(data);
            default:
                return this.#removeGeoAndCopyrightBlock(data);
        }
    }

    /**
     * Устанавливает фейковую геолокацию пользователя
     * @param {Object} data Данные геолокации для обработки
     * @returns {Object} Модифицированные данные
     */
    #setFakeUserLocation(data) {
        if (data.ip) {
            data.ip = this.#transformIpAddr(data.ip);
        }
        if (data.country) {
            data.country = FAKE_USER_LOCATION.COUNTRY;
        }
        if (data.iso_code) {
            data.iso_code = FAKE_USER_LOCATION.ISO_CODE;
        }
        if (data.timezone) {
            data.timezone = FAKE_USER_LOCATION.TIMEZONE;
        }
        if (data.restrictions?.hide_torrents) {
            data.restrictions.hide_torrents = false;
        }
        return data;
    }

    /**
     * Трансформирует IP адрес
     * @param {string} ip Оригинальный IP
     * @returns {string} Модифицированный IP
     */
    #transformIpAddr(ip) {
        const octets = ip.split('.');
        if (octets.length !== 4) {
            return ip;
        }
        octets[0] = FAKE_USER_LOCATION.IP_OCTETS[0];
        octets[1] = FAKE_USER_LOCATION.IP_OCTETS[1];
        return octets.join('.').toString();
    }

    /**
     * Удаляет гео и копирайт блокировки для каждого элемента массива
     * @param {Array} data Массив данных
     * @returns {Array} Модифицированный массив
     */
    #removeGeoAndCopyrightBlockEach(data) {
        return data.map(item => this.#removeGeoAndCopyrightBlock(item));
    }

    /**
     * Удаляет гео и копирайт блокировки
     * @param {Object} data Данные для обработки
     * @returns {Object} Модифицированные данные
     */
    #removeGeoAndCopyrightBlock(data) {
        if (data.is_blocked_by_geo) {
            data.is_blocked_by_geo = false;
        }
        if (data.is_blocked_by_copyrights) {
            data.is_blocked_by_copyrights = false;
        }
        return data;
    }
}