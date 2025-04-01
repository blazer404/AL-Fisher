class ALFisher {
    static BASE_ROUTE = '/api/v1/anime/releases/';

    static ROUTES = {
        LATEST: this.BASE_ROUTE + 'latest',
        RANDOM: this.BASE_ROUTE + 'random',
    }

    static ORIGINAL_FETCH = window.fetch.bind(window);

    static main = () => this.#replaceFetch();

    static #replaceFetch = () => {
        window.fetch = async (url, options) => {
            let response = await this.ORIGINAL_FETCH(url, options);
            if (this.#hasTargetRoute(response.url, this.BASE_ROUTE)) {
                LogPrinter.logInfo('Перехватил запрос...', url);
                LogPrinter.logInfo('Модифицирую ответ...');
                response = await this.#processResponse(response);
                LogPrinter.logInfo('Ответ модифицирован...');
            }
            return response;
        };
    }

    static #hasTargetRoute = (currentUrl, targetRoute) => currentUrl.includes(targetRoute);

    static #processResponse = async (originalResponse) => {
        try {
            const clonedResponse = originalResponse.clone();
            let data = await clonedResponse.json();
            data = this.#modifyData(clonedResponse.url, data);
            return this.#createModifiedResponse(originalResponse, data);
        } catch (error) {
            LogPrinter.logError('Ошибка при обработке ответа:', error);
            return originalResponse;
        }
    };

    static #modifyData = (url, data) => {
        if (!data) {
            LogPrinter.logWarning('Данные не найдены...');
        }
        if (typeof data !== 'object' || data === null) {
            LogPrinter.logWarning('Данные не являются объектом...');
        }
        switch (true) {
            case this.#hasTargetRoute(url, this.ROUTES.LATEST):
                LogPrinter.logInfo('/latest');
                //todo прогнать циклично каждый элемент в массиве
                break;
            case this.#hasTargetRoute(url, this.ROUTES.RANDOM):
                LogPrinter.logInfo('/random');
                //todo прогнать циклично каждый элемент в массиве
                break;
            default:
                LogPrinter.logInfo('/');
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

    static #createModifiedResponse = (originalResponse, modifiedData) => {
        return new Response(JSON.stringify(modifiedData), {
            headers: originalResponse.headers,
            status: originalResponse.status,
            statusText: originalResponse.statusText,
        });
    }
}

class LogPrinter {
    static logPrefix = '[AL Fisher]';
    static colorGreen = '\x1b[32m';
    static colorYellow = '\x1b[33m';
    static colorRed = '\x1b[31m';
    static colorReset = '\x1b[0m';

    static logInfo = (message, details = '') => console.log(`${this.colorGreen}${this.logPrefix}${this.colorReset} ${message}`, details);
    static logWarning = (message) => console.log(`${this.colorYellow}${this.logPrefix}${this.colorReset} ${message}`);
    static logError = (message) => console.log(`${this.colorRed}${this.logPrefix}${this.colorReset} ${message}`);
}


ALFisher.main();
