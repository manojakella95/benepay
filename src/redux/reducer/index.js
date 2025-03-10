import FrameReducer from './frame.reducer';

export const initialState = {
    device: {
        width: 0,
        scale: 0,
        breakpoint: 'xs'
    },
    payment: {}
};

export default function RootReducer(state = initialState, action = {}) {
    console.log("action ", action)
    console.log("state ", state)
    FrameReducer(state, action);
}
