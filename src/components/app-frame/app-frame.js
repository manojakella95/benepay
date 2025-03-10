import React, { useEffect, useState } from "react";
import AppHeader from "./app-header/app-header";
import Action from "../../redux/action";
import { connect } from "react-redux";
import AppRouter from "../../app-router";

const AppFrame = (props) => {
  const [isDeviceMobile, setIsDeviceMobile] = useState(false);
  useEffect(() => {
    onWindowResize();
    window.addEventListener("resize", onWindowResize);
  }, []);

  const onWindowResize = () => {
    const device = {
      width: document.documentElement.clientWidth,
      scale: 0,
      breakpoint: "xs",
    };
    // console.log('device ', device.width);
    if (device.width > 1024) {
      device.scale = 3;
      device.breakpoint = "lg";
      props.dispatch({ type: Action.UpdateDevice, device });
      setIsDeviceMobile(false)
    } else if (device.width > 768) {
      device.scale = 2;
      device.breakpoint = "md";
      props.dispatch({ type: Action.UpdateDevice, device });
      setIsDeviceMobile(false)
    } else if (device.width > 510) {
      device.scale = 1;
      device.breakpoint = "sm";
      props.dispatch({ type: Action.UpdateDevice, device });
      setIsDeviceMobile(false)
    } else {
      device.scale = 0;
      device.breakpoint = "xs";
      props.dispatch({ type: Action.UpdateDevice, device });
      setIsDeviceMobile(true)
    }
  };

  return (
    <div className={"app-frame-main"}>
      <AppRouter />
      {/* <AppFooter/> */}
    </div>
  );
};

function mapStateToProps(state) {
  return {
    device: state.device,
  };
}

export default connect(mapStateToProps)(AppFrame);
