import {FetchInterceptor} from './module/FetchInterceptor';
import {Logger} from "./module/Logger";

(() => {
    Logger.info('Инициализация модуля...');
    new FetchInterceptor().patchFetch();
})();