import React, { useEffect, useState } from "react";
import successIcon from "../../assets/images/cancelled.png";
import merchantLogo from "../../assets/robotic-school.png";
import "./payment-cancelled.css";
import mrcVisaLogo from "../../assets/visa-mastercard-logo.png";
import cardsLogo from "../../assets/cards.png";
import paymentRequestLogo from "../../assets/payment-request.svg";
import InfoIcon from "../../assets/info.png";
import { connect } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import AppHeader from "../../components/app-frame/app-header/app-header";
import getSymbolFromCurrency from "currency-symbol-map";
import moment from "moment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { commonRedirectUrl } from "../../config/urlConfig";
import PaymentList from "../partial-payments/list-payment";
import LocationService from "../../service/api/location.service";
import { PaymentService } from "../../service/api/payment.service";
import Layout from "../seamless-payment-page/layout";
import HorizontalNonLinearStepper from "../seamless-payment-page/layout/stepper";
import benepayLogo from "../seamless-payment-page/layout/asset/benepay-transperent.png";
import { toast } from "react-toastify";
import { Alert } from "@mui/material";

const PaymentCancelled = (props) => {
  const { device } = props;
  const { state } = useLocation();
  const navigate = useNavigate();
  const { payment } = state || {};

  // useEffect hook to fetch and send the payer country when the 'device' changes
  useEffect(() => {
    fetchAndSendPayerCountry();
  }, [device]);

  /**
  * Method to fetch the payer's country using the browser's IP location and send it to an API.
  */
  const fetchAndSendPayerCountry = async () => {
    const payerCountry = await LocationService.getUserCountry(payment);
    if (payerCountry) {
      sendPayerCountry(payerCountry);
    }
  };

  /**
    * Method to send the payer's country information to the API.
    * 
    * @param {Object} payerCountry - The object containing payer country information and transaction details.
    */
  const sendPayerCountry = async (payerCountry) => {
    const payerCountryResponse = await PaymentService.sendPayerCountry(payerCountry);
  };

  const closeWindow = () => {
    window.open(commonRedirectUrl, '_self');
  }

  return (
    <>
      <Layout
        headerLogo={payment.merchantLogoUrl}
        headerChildren={<HorizontalNonLinearStepper skipOtherActiveindex={true} activeIndex={1} setActualActiveIndex={(index) => { }} lastStep={"Cancelled"} />}
        bgColor="bg-white"
      >
        <div class="font-roboto grid grid-cols-2 md:grid-cols-3 gap-1 p-2 font-roboto min-h-[95%]">
          <div className="bg-white item-center justify-center h-auto hidden md:flex">
            <img
              className="h-[30%] max-h-[175px] bg-transparent aspect-auto mr-2"
              src={payment.merchantLogoUrl}
              alt=""
              style={{ marginTop: '15%' }}
            />
          </div>

          <div className="col-span-2 h-full flex items-center justify-center lg:mr-5">
            <div className="h-full w-full max-w-4xl bg-white border border-gray-200 rounded-lg drop-shadow-xl relative">
              <div className="mx-2 md:mx-10 mt-6 max-h-full">
                <div className="min-w-full">
                  <Alert severity="info" className="mb-1">This payment has been cancelled by the merchant.</Alert>
                  <Alert severity="info">Please contact merchant for more details</Alert>
                  <div className="h-fit flex flex-col justify-center items-center w-full mt-6 mx-auto">
                    <img
                      class="h-32 bg-transparent aspect-auto mx-auto mb-4"
                      src={successIcon}
                      alt=""
                    />
                    <p className="text-gray-800 font-semibold text-xl mb-1">Transaction Cancelled</p>
                    <p className="text-gray-700 text-sm">Thank you for choosing BenePay</p>
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
                    {/* <FontAwesomeIcon icon={faCopy} title="copy" onClick={handleCopyClick} className="mb-1 hover:cursor-pointer"/> */}
                  </div>

                  <div className="text-base grid grid-cols-2 md:grid-cols-2 gap-y-3 gap-x-3">
                    <p>Transaction Id</p>
                    <p className="truncate">{payment && payment.requestorTransactionId ? payment.requestorTransactionId : "NA"}</p>
                  </div>

                  <div className="text-base grid grid-cols-2 md:grid-cols-2 gap-y-3 gap-x-3">
                    <p>Description</p>
                    <p className="">{payment && payment.reasonForCollection ? payment.reasonForCollection : "NA"}</p>
                  </div>

                  <div className="text-base grid grid-cols-2 md:grid-cols-2 gap-y-3 gap-x-3">
                    <p>Reference</p>
                    <p className="truncate">{payment && payment.collectionReferenceNumber ? payment.collectionReferenceNumber : "NA"}</p>
                  </div>

                  <div className="">
                    <div className="mb-8 mt-4 flex items-center">
                      <div
                        className="w-full bg-transparent text-gray-700 rounded-lg mb-2 flex justify-start items-center">
                        <button
                          onClick={closeWindow}
                          className={`bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 ease-in-out flex justify-center items-center`}>
                          <p>{"Close Window"}</p>
                        </button>
                      </div>
                    </div>
                  </div>
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

export default connect(mapStateToProps)(PaymentCancelled);
