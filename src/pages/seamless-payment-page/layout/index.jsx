import React from "react";

//Header
import Header from "./header";

const Layout = (props) => {
    return (
        <div className={`h-screen ${props.bgColor ? props.bgColor : 'bg-gray-100'}`}>
            <Header logo={props.headerLogo} headerChildren={props.headerChildren}/>

            <div className="mx-auto w-[95%] md:w-[90%] lg:w-[80%] xl:w-[65%] h-[90%] min-h-fit">
                {props.children}
            </div>
        </div>
    );
}

export default Layout;
