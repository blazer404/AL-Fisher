(() => {
    const ORIGINAL_FETCH = window.fetch.bind(window);

    const FAKE_USER_LOCATION = Object.freeze({
        COUNTRY: 'Austria',
        ISO_CODE: 'AT',
        TIMEZONE: 'Europe/Vienna',
        IP_OCTETS: [137, 208, 0, 0],
    });
    const ROUTE = Object.freeze({
        USER_LOCATION: '/api/v1/accounts/users/location',
        RELEASES: '/api/v1/anime/releases/',
        RELEASES_LATEST: '/api/v1/anime/releases/latest',
        RELEASES_RANDOM: '/api/v1/anime/releases/random',
    });

    const LOG_PREFIX = '[AL Fisher]';
    const COLOR_CODE = Object.freeze({
        GREEN: '\x1b[32m',
        YELLOW: '\x1b[33m',
        RED: '\x1b[31m',
        RESET: '\x1b[0m',
    });
    const logger = Object.freeze({
        /**
         * Информационное сообщение
         * @param {string} message - Основное сообщение
         * @param {string|Object} [details] - Дополнительные детали
         */
        info(message, details) {
            console.log(this._formatLog(COLOR_CODE.GREEN, message, details));
        },

        /**
         * Предупреждение
         * @param {string} message - Текст предупреждения
         */
        warning(message) {
            console.log(this._formatLog(COLOR_CODE.YELLOW, message));
        },

        /**
         * Ошибка
         * @param {string} message - Текст ошибки
         * @param {Error} [error] - Объект ошибки
         */
        error(message, error) {
            console.error(this._formatLog(COLOR_CODE.RED, message, error));
        },

        /**
         * Форматирует строку лога с цветом
         * @param {string} color - ANSI цветовой код
         * @param {string} message - Основное сообщение
         * @param {string|Object} [extra=''] - Дополнительная информация
         * @returns {string} Отформатированная строка лога
         * @private
         */
        _formatLog(color, message, extra = '') {
            return `${color}${LOG_PREFIX}${COLOR_CODE.RESET} ${message} ${extra}`.trim();
        }
    });


    /**
     * Инициализирует модуль, подменяя оригинальный fetch
     * @returns {void}
     */
    function init() {
        logger.info('Инициализация модуля...');
        patchFetch();
    }

    /**
     * Подменяет оригинальный window.fetch на обработчик
     * @returns {void}
     */
    function patchFetch() {
        window.fetch = async (url, options) => fetchHandler(url, options);
    }

    /**
     * Обработчик fetch запросов
     * @async
     * @param {string|Request} url URL запроса
     * @param {Object} [options] Параметры запроса
     * @returns {Promise<Response>} Обработанный ответ
     */
    async function fetchHandler(url, options) {
        try {
            let response = await ORIGINAL_FETCH(url, options);
            const targetRoutes = [ROUTE.USER_LOCATION, ROUTE.RELEASES];
            const isTargetRoute = targetRoutes.some(route => hasTargetRoute(response.url, route));
            if (isTargetRoute) {
                logger.info('Модифицирую ответ для', url);
                response = await handleResponse(response);
                logger.info('Ответ модифицирован для', url);
            }
            return response;
        } catch (e) {
            logger.error('Ошибка при обработке запроса:', e);
            throw e;
        }
    }

    /**
     * Проверяет, соответствует ли URL целевому маршруту
     * @param {string} currentUrl Проверяемый URL
     * @param {string} targetRoute Целевой маршрут
     * @returns {boolean} true если URL соответствует маршруту
     */
    function hasTargetRoute(currentUrl, targetRoute) {
        try {
            if (!currentUrl || !targetRoute) {
                return false;
            }
            return new URL(currentUrl, window.location.origin).pathname.startsWith(targetRoute);
        } catch (e) {
            logger.error('Ошибка при проверке URL:', e);
            return false;
        }
    }

    /**
     * Обрабатывает и модифицирует ответ сервера
     * @async
     * @param {Response} originalResponse Оригинальный ответ
     * @returns {Promise<Response>} Модифицированный ответ
     */
    async function handleResponse(originalResponse) {
        try {
            if (!isValidResponse(originalResponse)) {
                logger.warning('Некорректный ответ от сервера...');
                return originalResponse;
            }
            const [clonedResponse, data] = await Promise.all([
                originalResponse.clone(),
                originalResponse.json()
            ]);
            const modifiedData = modifyData(clonedResponse.url, data);
            return createModifiedResponse(originalResponse, modifiedData);
        } catch (e) {
            logger.error('Ошибка модификации ответа:', e);
            return originalResponse;
        }
    }

    /**
     * Проверяет валидность ответа для обработки
     * @param {Response} response Ответ для проверки
     * @returns {boolean} true если ответ валиден
     */
    function isValidResponse(response) {
        return response && response.ok && response.headers.get('content-type')?.includes('application/json');
    }

    /**
     * Модифицирует JSON данные в зависимости от URL
     * @param {string} url URL запроса
     * @param {Object|Array} data Данные для модификации
     * @returns {Object|Array} Модифицированные данные
     */
    function modifyData(url, data) {
        if (!data || typeof data !== 'object') {
            logger.warning('Некорректные данные');
            return data;
        }
        switch (true) {
            case hasTargetRoute(url, ROUTE.USER_LOCATION):
                return setFakeUserLocation(data);
            case hasTargetRoute(url, ROUTE.RELEASES_LATEST):
            case hasTargetRoute(url, ROUTE.RELEASES_RANDOM):
                return removeGeoAndCopyrightBlockEach(data);
            default:
                return removeGeoAndCopyrightBlock(data);
        }
    }

    /**
     * Устанавливает фейковую геолокацию пользователя
     * @param {Object} data Данные геолокации для обработки
     * @returns {Object} Модифицированные данные
     */
    function setFakeUserLocation(data) {
        if (data.ip) {
            data.ip = transformIpAddr(data.ip);
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
    function transformIpAddr(ip) {
        const octets = ip.split('.');
        if (octets.length !== 4) {
            return ip;
        }
        octets[0] = FAKE_USER_LOCATION.IP_OCTETS[0];
        octets[1] = FAKE_USER_LOCATION.IP_OCTETS[1];
        return octets.join('.');
    }

    /**
     * Удаляет гео и копирайт блокировки для каждого элемента массива
     * @param {Array} data Массив данных
     * @returns {Array} Модифицированный массив
     */
    function removeGeoAndCopyrightBlockEach(data) {
        return data.map(item => removeGeoAndCopyrightBlock(item));
    }

    /**
     * Удаляет гео и копирайт блокировки
     * @param {Object} data Данные для обработки
     * @returns {Object} Модифицированные данные
     */
    function removeGeoAndCopyrightBlock(data) {
        if (data.is_blocked_by_geo) {
            data.is_blocked_by_geo = false;
        }
        if (data.is_blocked_by_copyrights) {
            data.is_blocked_by_copyrights = false;
        }
        return data;
    }

    /**
     * Создает модифицированный ответ сервера
     * @param {Response} originalResponse Оригинальный ответ
     * @param {Object|Array} modifiedData Модифицированные данные
     * @returns {Response} Новый объект Response
     */
    function createModifiedResponse(originalResponse, modifiedData) {
        const headers = new Headers(originalResponse.headers);
        headers.delete('content-length');
        return new Response(JSON.stringify(modifiedData), {
            headers,
            status: originalResponse.status,
            statusText: originalResponse.statusText,
        });
    }


    init();
})();