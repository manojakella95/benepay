import React from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router";
import Layout from "../seamless-payment-page/layout";
import HorizontalNonLinearStepper from "../seamless-payment-page/layout/stepper";
import benepayLogo from "../seamless-payment-page/layout/asset/benepay-transperent.png";
import pendingIcon from "../../assets/pending.png";
import { Alert } from "@mui/material";
import { commonRedirectUrl } from "../../config/urlConfig";

const PaymentPending = (props) => {
  const { state } = useLocation();
  const { payment } = state || {};

  const closeWindow = () => {
    window.open(commonRedirectUrl, '_self');
  }

  return (
    <>
      <Layout
        headerLogo={payment.customerLogo}
        headerChildren={<HorizontalNonLinearStepper skipOtherActiveindex={true} activeIndex={1} setActualActiveIndex={(index) => { }} lastStep={"Pending"} />}
        bgColor="bg-white"
      >
        <div class="font-roboto grid grid-cols-2 md:grid-cols-3 gap-1 p-2 font-roboto min-h-[95%]">
          <div className="bg-white item-center justify-center h-auto hidden md:flex">
            <img
              className="h-[30%] max-h-[175px] bg-transparent aspect-auto mr-2"
              src={payment.customerLogo}
              alt=""
              style={{ marginTop: '15%' }}
            />
          </div>

          <div className="col-span-2 h-full flex items-center justify-center lg:mr-5">
            <div className="h-full w-full max-w-4xl bg-white border border-gray-200 rounded-lg drop-shadow-xl relative">
              <div className="mx-2 md:mx-10 mt-6 max-h-full">
                <div className="min-w-full">
                  <Alert severity="info">Please DO NOT retry until confirmation is received from Bank.</Alert>
                  <div className="h-fit flex flex-col justify-center items-center w-full mt-6 mx-auto">
                    <img
                      class="h-32 bg-transparent aspect-auto mx-auto mb-4"
                      src={pendingIcon}
                      alt=""
                    />
                    <p className="text-gray-800 font-semibold text-xl mb-1">Transaction Pending</p>
                  </div>
                  <div class="grid grid-rows-1 grid-flow-col mt-2">
                    <div>
                      <hr className="w-auto" />
                    </div>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="mt-4 mx-2 md:mx-10 space-y-3 text-sm md:text-base">
                  <div className="mb-5 flex items-center text-blue-700">
                    <p className="text-lg font-bold tracking-tight mr-4">Your Summary</p>
                  </div>
                  <p>Reason : {payment && payment.engineStatus ? payment.engineStatus : "Payment Pending. Please contact support@benepay.io for assistance"}</p>
                </div>

                <div className="grid grid-cols-1" style={{ marginTop: '3%' }}>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg mt-3 hover:bg-blue-700 transition-all duration-200 ease-in-out flex justify-center items-center" onClick={closeWindow}>Close window</button>
                </div>

                <div className="absolute flex justify-end right-0 bottom-0" style={{ marginTop: '0%' }} >
                  <a href="#" className="-m-1.5 p-1.5 flex items-center justify-center">
                    <p className="text-sm font-medium tracking-tight text-blue-700">Powered By</p>
                    <img className="h-16 w-auto" src={benepayLogo} alt="" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};
const mapStateToProps = (state) => {
  return {
    device: state.device,
  };
};

export default connect(mapStateToProps)(PaymentPending);
