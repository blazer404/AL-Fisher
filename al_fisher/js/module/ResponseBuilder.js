export class ResponseBuilder {
    /**
     * Создает модифицированный ответ сервера
     * @param {Response} originalResponse Оригинальный ответ
     * @param {Object|Array} modifiedData Модифицированные данные
     * @returns {Response} Новый объект Response
     */
    createModifiedResponse(originalResponse, modifiedData) {
        const headers = this.#createHeaders(originalResponse.headers);
        return this.#createResponse(originalResponse, modifiedData, headers);
    }

    /**
     * Устанавливает новые заголовки ответа
     * @param originalHeaders Оригинальные заголовки
     * @returns {Headers}
     */
    #createHeaders(originalHeaders) {
        const headers = new Headers(originalHeaders);
        headers.delete('content-length');
        return headers;
    }

    /**
     * Создает модифицированный ответ
     * @param {Response} originalResponse Оригинальный ответ
     * @param {Object|Array} modifiedData Модифицированные данные
     * @param {Headers} headers Новые заголовки
     * @returns {Response} Новый объект Response
     */
    #createResponse(originalResponse, modifiedData, headers) {
        return new Response(JSON.stringify(modifiedData), {
            headers,
            status: originalResponse.status,
            statusText: originalResponse.statusText,
        });
    }
}