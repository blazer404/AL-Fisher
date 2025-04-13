import {MESSAGE_LIB} from './module/Constants';
import {FetchInterceptor} from './module/FetchInterceptor';
import {Logger} from './module/Logger';

(() => {
    Logger.info(MESSAGE_LIB.INIT, '', true);
    new FetchInterceptor().enableInterception();
})();