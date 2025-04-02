(() => {
    const FAKE_USER_LOCATION = {
        COUNTRY: 'Austria',
        ISO_CODE: 'AT',
        TIMEZONE: 'Europe/Vienna',
        IP_OCTETS: [137, 208, 0, 0],
    }
    const ROUTE = {
        USER_LOCATION: '/api/v1/accounts/users/location',
        RELEASES: '/api/v1/anime/releases/',
        RELEASES_LATEST: '/api/v1/anime/releases/latest',
        RELEASES_RANDOM: '/api/v1/anime/releases/random',
    }

    const LOG_PREFIX = '[AL Fisher]';
    const COLOR_CODE = {
        GREEN: '\x1b[32m',
        YELLOW: '\x1b[33m',
        RED: '\x1b[31m',
        RESET: '\x1b[0m',
    }
    const logger = {
        info: function logInfo(message, details) {
            console.log(this.formatLog(COLOR_CODE.GREEN, message, details));
        },
        warning: function logWarning(message) {
            console.log(this.formatLog(COLOR_CODE.YELLOW, message));
        },
        error: function logError(message, error) {
            console.log(this.formatLog(COLOR_CODE.RED, message, error));
        },
        formatLog: function formatLog(color, message, extra = '') {
            return `${color}${LOG_PREFIX}${COLOR_CODE.RESET} ${message} ${extra}`.trim();
        }
    }

    const ORIGINAL_FETCH = window.fetch.bind(window);

    const init = () => patchFetch();

    function patchFetch() {
        window.fetch = async (url, options) => fetchHandler(url, options);
    }

    async function fetchHandler(url, options) {
        try {
            let response = await ORIGINAL_FETCH(url, options);
            if (hasTargetRoute(response.url, ROUTE.USER_LOCATION) || hasTargetRoute(response.url, ROUTE.RELEASES)) {
                logger.info('Модифицирую ответ для', url);
                response = await processResponse(response);
                logger.info('Ответ модифицирован...');
            }
            return response;
        } catch (e) {
            logger.error('Ошибка при обработке запроса:', e);
            throw e;
        }
    }

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

    async function processResponse(originalResponse) {
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

    function isValidResponse(response) {
        return response && response.ok && response.headers.get('content-type')?.includes('application/json');
    }

    function modifyData(url, data) {
        if (!data || typeof data !== 'object') {
            logger.warning('Некорректные данные');
            return data;
        }
        switch (true) {
            case hasTargetRoute(url, ROUTE.USER_LOCATION):
                return modifyUserLocationData(data);
            case hasTargetRoute(url, ROUTE.RELEASES_LATEST):
                return modifyReleaseLatestData(data);
            case hasTargetRoute(url, ROUTE.RELEASES_RANDOM):
                return modifyReleaseRandomData(data);
            default:
                return modifyDefaultData(data);

        }
    }

    function modifyUserLocationData(data) {
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
        if (data.restrictions && data.restrictions.hide_torrents) {
            data.restrictions.hide_torrents = false;
        }
        console.log('LOCATION');
        console.table(data);
        return data;
    }

    function transformIpAddr(ip) {
        const octets = ip.split('.');
        if (octets.length !== 4) {
            return ip;
        }
        octets[0] = FAKE_USER_LOCATION.IP_OCTETS[0];
        octets[1] = FAKE_USER_LOCATION.IP_OCTETS[1];
        return octets.join('.');
    }


    function modifyReleaseLatestData(data) {
        console.log('LATEST');
        console.table(data);
        return data;
    }

    function modifyReleaseRandomData(data) {
        console.log('RANDOM');
        console.table(data);
        return data;
    }

    function modifyDefaultData(data) {
        if (data.is_blocked_by_geo) {
            data.is_blocked_by_geo = false;
        }
        if (data.is_blocked_by_copyrights) {
            data.is_blocked_by_copyrights = false;
        }
        console.log('DEFAULT');
        console.table(data);
        return data;
    }


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