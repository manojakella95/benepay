import { combineReducers } from "redux";

const createReducer = asyncReducers => {
    return combineReducers({
        ...asyncReducers
    });
};

export default createReducer;
