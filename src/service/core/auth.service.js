import {StorageKeys, StorageService, TempStorage} from "./storage.service";

export default class AuthService {
    static isUserLoggedIn() {
        const user = TempStorage.loggedInUser;
        const authToken = TempStorage.authToken;
        // return Boolean(user) && Boolean(authToken);
        return true;
    }

    static getUser() {
        return StorageService.getObj(StorageKeys.user) || {}
    }
}
