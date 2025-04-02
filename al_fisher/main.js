class ALFisher {

    static #ROUTE = {
        USER_LOCATION: '/api/v1/accounts/users/location',
        RELEASES: '/api/v1/anime/releases/',
        RELEASES_LATEST: '/api/v1/anime/releases/latest',
        RELEASES_RANDOM: '/api/v1/anime/releases/random',
    }

    static #LOG_PREFIX = '[AL Fisher]';
    static #COLOR_CODE = {
        GREEN: '\x1b[32m',
        YELLOW: '\x1b[33m',
        RED: '\x1b[31m',
        RESET: '\x1b[0m',
    }

    static #ORIGINAL_FETCH = window.fetch.bind(window);

    static main = () => this.#patchFetch();

    static #patchFetch() {
        window.fetch = async (url, options) => this.#fetchHandler(url, options);
    }

    static async #fetchHandler(url, options) {
        try {
            let response = await this.#ORIGINAL_FETCH(url, options);
            if (this.#hasTargetRoute(response.url, this.#ROUTE.USER_LOCATION) || this.#hasTargetRoute(response.url, this.#ROUTE.RELEASES)) {
                this.#log('Модифицирую ответ для', url);
                response = await this.#processResponse(response);
                this.#log('Ответ модифицирован...');
            }
            return response;
        } catch (e) {
            this.#logError('Ошибка при обработке запроса:', e);
            throw e;
        }
    }

    static #hasTargetRoute(currentUrl, targetRoute) {
        try {
            if (!currentUrl || !targetRoute) {
                return false;
            }
            return new URL(currentUrl, window.location.origin).pathname.startsWith(targetRoute);
        } catch (e) {
            this.#logError('Ошибка при проверке URL:', e);
            return false;
        }
    }

    static async #processResponse(originalResponse) {
        try {
            if (!this.#isValidResponse(originalResponse)) {
                this.#logWarning('Некорректный ответ от сервера...');
                return originalResponse;
            }
            const [clonedResponse, data] = await Promise.all([
                originalResponse.clone(),
                originalResponse.json()
            ]);
            const modifiedData = this.#modifyData(clonedResponse.url, data);
            return this.#createModifiedResponse(originalResponse, modifiedData);
        } catch (e) {
            this.#logError('Ошибка модификации ответа:', e);
            return originalResponse;
        }
    }

    static #isValidResponse(response) {
        return response && response.ok && response.headers.get('content-type')?.includes('application/json');
    }

    static #modifyData(url, data) {
        if (!data || typeof data !== 'object') {
            this.#logWarning('Некорректные данные');
            return data;
        }
        switch (true) {
            case this.#hasTargetRoute(url, this.#ROUTE.USER_LOCATION):
                return this.#modifyUserLocationData(data);
            case this.#hasTargetRoute(url, this.#ROUTE.RELEASES_LATEST):
                return this.#modifyReleaseLatestData(data);
            case this.#hasTargetRoute(url, this.#ROUTE.RELEASES_RANDOM):
                return this.#modifyReleaseRandomData(data);
            default:
                return this.#modifyDefaultData(data);

        }
    }

    static #modifyUserLocationData(data) {
        if (data.ip) {
            data.ip = this.#transformIpAddr(data.ip);
        }
        if (data.country) {
            data.country = 'Austria';
        }
        if (data.iso_code) {
            data.iso_code = 'AT';
        }
        if (data.timezone) {
            data.timezone = 'Europe/Vienna';
        }
        if (data.restrictions && data.restrictions.hide_torrents) {
            data.restrictions.hide_torrents = false;
        }
        console.log('LOCATION');
        console.table(data);
        return data;
    }

    static #transformIpAddr(ip) {
        const octets = ip.split('.');
        if (octets.length !== 4) {
            return ip;
        }
        octets[0] = '137';
        octets[1] = '208';
        return octets.join('.');
    }


    static #modifyReleaseLatestData(data) {
        console.log('LATEST');
        console.table(data);
        return data;
    }

    static #modifyReleaseRandomData(data) {
        console.log('RANDOM');
        console.table(data);
        return data;
    }

    static #modifyDefaultData(data) {
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


    static #createModifiedResponse(originalResponse, modifiedData) {
        const headers = new Headers(originalResponse.headers);
        headers.delete('content-length');
        return new Response(JSON.stringify(modifiedData), {
            headers,
            status: originalResponse.status,
            statusText: originalResponse.statusText,
        });
    }


    static #log(message, details) {
        console.log(this.#formatLog(this.#COLOR_CODE.GREEN, message, details));
    }

    static #logWarning(message) {
        console.log(this.#formatLog(this.#COLOR_CODE.YELLOW, message));
    }

    static #logError(message, error) {
        console.log(this.#formatLog(this.#COLOR_CODE.RED, message, error));
    }

    static #formatLog(color, message, extra = '') {
        return `${color}${this.#LOG_PREFIX}${this.#COLOR_CODE.RESET} ${message} ${extra}`.trim();
    }
}

ALFisher.main();
