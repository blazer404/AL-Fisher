export class DataValidator {
    /**
     * Ответ валиден и может быть обработан
     * @param {Response} response Ответ сервера
     * @returns {boolean}
     */
    static isValidResponse(response) {
        return response?.ok && response.headers.get('content-type')?.includes('application/json');
    }

    /**
     * Данные валидны и могут быть обработаны
     * @param {Object} data Проверяемые данные
     * @returns {boolean}
     */
    static isValidData(data) {
        return data && typeof data === 'object';
    }
}