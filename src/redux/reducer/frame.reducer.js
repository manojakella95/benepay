import Action from "../action";
import {initialState} from "./index";

export default function FrameReducer(state = initialState, action = {}) {
    switch (action.type) {
        case Action.UpdateDevice:
            return {
                ...state,
                device: action.device,
            };
        case Action.UpdateUser:
            return {
                ...state,
                payment: action.user,
            };
        default:
            return state;
    }
}
