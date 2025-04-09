export class ResponseBuilder {
    /**
     * Создает модифицированный ответ сервера
     * @param {Response} originalResponse Оригинальный ответ
     * @param {Object|Array} transformedData Модифицированные данные
     * @returns {Response} Новый объект Response
     */
    transformResponse(originalResponse, transformedData) {
        const headers = this.#createHeaders(originalResponse.headers);
        return this.#createResponse(originalResponse, transformedData, headers);
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
     * @param {Object|Array} data Данные ответа
     * @param {Headers} headers Новые заголовки
     * @returns {Response} Новый объект Response
     */
    #createResponse(originalResponse, data, headers) {
        return new Response(JSON.stringify(data), {
            headers,
            status: originalResponse.status,
            statusText: originalResponse.statusText,
        });
    }
}