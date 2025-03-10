import React, { useState } from "react";
import maintenanceIcon from "../../assets/images/404.png";
import './payment-invalid.css'

function PaymentInvalid () {
    return (
        <div className="app-maintenance-main">
            <div className="maintenance-vector-wrapper mt-16">
            <img src={maintenanceIcon} className="maintenance-vector"/>
            </div>
            <h4 className="text-purple-800 text-2xl text-center font-semibold mt-16 mb-4">Invalid Payment Reference</h4>
            <div className="maintenance-msg text-center w-full flex justify-center">
            <p className="text-gray-500 w-80 mb-4">Record not found! <br/> Please enter valid payment reference</p>
            </div>
        </div>

    )
}

export default PaymentInvalid;