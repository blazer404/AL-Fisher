export class Logger {
    static #LOG_PREFIX = '[Libria Interceptor]';
    static #COLOR_CODE = Object.freeze({
        GREEN: '\x1b[32m',
        YELLOW: '\x1b[33m',
        RED: '\x1b[31m',
        CYAN: '\x1b[36m',
        RESET: '\x1b[0m',
    });

    /**
     * Информационное сообщение
     * @param {string} message Основное сообщение
     * @param {string|Object} [details] Дополнительные детали
     * @param {boolean} accentColor Использовать акцентный цвет
     */
    static info(message, details, accentColor = false) {
        const color = accentColor ? this.#COLOR_CODE.CYAN : this.#COLOR_CODE.GREEN;
        console.log(this.#format(color, message, details));
    }

    /**
     * Предупреждение
     * @param {string} message Текст предупреждения
     */
    static warning(message) {
        console.log(this.#format(this.#COLOR_CODE.YELLOW, message));
    }

    /**
     * Ошибка
     * @param {string} message Текст ошибки
     * @param {Error} [error] Объект ошибки
     */
    static error(message, error) {
        console.error(this.#format(this.#COLOR_CODE.RED, message, error));
    }

    /**
     * Форматирует строку лога с цветом
     * @param {string} color ANSI цветовой код
     * @param {string} message Основное сообщение
     * @param {string|Object} [extra=''] Дополнительная информация
     * @returns {string} Отформатированная строка лога
     * @private
     */
    static #format(color, message, extra = '') {
        return `${color}${this.#LOG_PREFIX}${this.#COLOR_CODE.RESET} ${message} ${extra}`.trim();
    }
}