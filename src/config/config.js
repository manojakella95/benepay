import {StorageKeys, StorageService} from "../service/core/storage.service";
import {Environment} from "../enum/common.enum";

export class config {

    static env = process.env.REACT_APP_ENVIRONMENT;

    static version = {
        majorRevision: 4,  // (new UI, lots of new features, conceptual change, etc.)
        minorRevision: 0,  // (maybe a change to a search box, 1 feature added, collection of bug fixes)
        bugFixes: 0,  // (Only bug fixes not new feature)
    };

    static get axios() {
        return {
            headers: {
                token: StorageService.get(StorageKeys.token)
            }
        }
    };

    static snackbarConfig = (type = 'info') => {
        return {
            variant: type,
            anchorOrigin: {vertical: 'top', horizontal: 'right'},
            persistent: true,
            // iconVariant: type
        }
    };

    static get isLocal() {
        if (window.location.hostname === 'localhost') {
            return true;
        }
        return false;
    }
}
