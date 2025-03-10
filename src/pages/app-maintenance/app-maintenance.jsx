import React, { useState } from "react";
import maintenanceIcon from "../../assets/maintenance.svg";
import './app-maintenance.css';
import benepayLogo from "../seamless-payment-page/layout/asset/benepay-transperent.png";

function AppMaintenance () {
    const queryParams = new URLSearchParams(location.search);
    const titleParam = queryParams.get('title');
    const messageParam = queryParams.get('message');

    const title = titleParam || "We'll be back soon!";
    const message = messageParam || "Benepay is undergoing some maintenance. Please try again after sometime";

    return (
        <div className="app-maintenance-main">
            <div className="maintenance-vector-wrapper">
                <img className="h-16 w-auto" src={benepayLogo} alt="" />
            </div>
            <div className="maintenance-vector-wrapper mt-16">
                <img src={maintenanceIcon} className="maintenance-vector"/>
            </div>
            <h4 className="text-purple-800 text-2xl text-center font-semibold mt-16 mb-4">{title}</h4>
            <div className="maintenance-msg text-center w-full flex justify-center">
                <p className="text-gray-500 w-80 mb-4">{message}</p>
            </div>
        </div>

    )
}

export default AppMaintenance;