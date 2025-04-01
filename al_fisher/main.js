class ALFisher {
    static #BASE_ROUTE = '/api/v1/anime/releases/';
    static #ROUTES = {
        LATEST: this.#BASE_ROUTE + 'latest',
        RANDOM: this.#BASE_ROUTE + 'random',
    }

    static #LOG_PREFIX = '[AL Fisher]';
    static #COLOR_CODE = {
        GREEN: '\x1b[32m',
        YELLOW: '\x1b[33m',
        RED: '\x1b[31m',
        RESET: '\x1b[0m',
    };

    static #ORIGINAL_FETCH = window.fetch.bind(window);

    static main = () => this.#patchFetch();

    static #patchFetch() {
        window.fetch = async (url, options) => this.#fetchHandler(url, options);
    }

    static async #fetchHandler(url, options) {
        try {
            let response = await this.#ORIGINAL_FETCH(url, options);
            if (response.url && this.#hasTargetRoute(response.url, this.#BASE_ROUTE)) {
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
    };

    static #isValidResponse(response) {
        return response && response.ok && response.headers.get('content-type')?.includes('application/json');
    }

    static #modifyData(url, data) {
        if (!data || typeof data !== 'object') {
            this.#logWarning('Некорректные данные');
            return data;
        }
        switch (true) {
            case this.#hasTargetRoute(url, this.#ROUTES.LATEST):
                //todo прогнать циклично каждый элемент в массиве
                break;
            case this.#hasTargetRoute(url, this.#ROUTES.RANDOM):
                //todo прогнать циклично каждый элемент в массиве
                break;
            default:
                //todo вынести в отдельный метод
                if (data.is_blocked_by_geo) {
                    data.is_blocked_by_geo = false;
                }
                if (data.is_blocked_by_copyrights) {
                    data.is_blocked_by_copyrights = false;
                }
                break;
        }
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
