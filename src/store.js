import { createStore } from "redux";
import createReducer from "./reducers";

const store = createStore(createReducer());

export default function configureStore() {
    store.asyncReducers = {};
    store.injectReducer = (key, asyncReducer) => {
        store.asyncReducers[key] = asyncReducer;
        store.replaceReducer(createReducer(store.asyncReducers));
    };
    return store;
}

export function getStore() {
    return store;
}
