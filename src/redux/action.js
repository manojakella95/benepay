export default class Action {
    static UpdateDeviceWidth = "UpdateDeviceWidth";
    static UpdateDevice = "UpdateDevice";
    static UpdateUser = "UpdateUser"

    dispatch;

    constructor(_this) {
        this.dispatch = _this.props.dispatch;
    }

    showGlobalProgress(show) {
        this.dispatch({type: Action.ToggleGlobalProgress, showGlobalProgress: show})
    }
}
