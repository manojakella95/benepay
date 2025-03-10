import React, { useEffect, useState } from "react";
import successIcon from "../../assets/payment-info.png";
import merchantLogo from "../../assets/robotic-school.png";
import "./payment-already-paid.css";
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
import { DateTimeFormats } from "../../config/constants";

const PaymentAlreadyPaid = (props) => {
  const { device } = props;
  const { state } = useLocation();
  const navigate = useNavigate();
  const { payment } = state || {};

  const [isEmailProcessing, setEmailProcessing] = useState(false);
  const [isEmailSent, setEmailSent] = useState(false);

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

  const [showCopiedMsg, setShowCopiedMsg] = useState(false);
  const closeWindow = () => {
    window.open(commonRedirectUrl, '_self');
  }

  const handleCopyClick = async () => {

    setShowCopiedMsg(true)
    if (!showCopiedMsg) {
      setTimeout(() => {
        setShowCopiedMsg(false)
      }, 500);
    }


    const valuesToCopy = [
      getSymbolFromCurrency(payment.collectionAmountCurrency),
      payment.finalDueAmount,
      payment.requestorTransactionId,
      payment.beneId,
      payment && payment.paymentDate ? `${moment(payment.paymentDate, DateTimeFormats.dateTimeFormatymdthms).format(DateTimeFormats.dateTimeFormatdmyhms)} (${payment.timeZone})` : "",
      payment.reasonForCollection,
      payment.collectionReferenceNumber,
    ];

    const labels = [
      "Amount : ",
      "",
      "Bene Transaction ID : ",
      "Payment confirmation ID : ",
      "Payment made on : ",
      "Towards : ",
      "Reference : ",
    ];
    const copyString = valuesToCopy
      .map((value, index) => labels[index] + value + " ")
      .filter((value) => value.trim() !== "")
      .join(" ");
    copyToClipboard(copyString);
    toast.success("Copied!")

    console.log("this is copied value : ", copyString)
  };

  const copyToClipboard = (text) => {
    const textField = document.createElement('textarea');
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
  };

  const sendEmail = async () => {
    if (isEmailSent) {
      toast.error("Email already sent!");
      return;
    }

    setEmailProcessing(true);
    const emailResponse = await PaymentService.sendEmail(
      payment?.requestorTransactionId
    );
    setEmailProcessing(false);
    if (emailResponse && emailResponse.status === 500) {
      toast.error("Something went wrong! Please again later");
      return;
    }
    toast.info("Email sent successfully");
    setEmailSent(true);
  };

  return (
    <>
      <Layout
        headerLogo={payment.merchantLogoUrl}
        headerChildren={<HorizontalNonLinearStepper skipOtherActiveindex={true} activeIndex={1} setActualActiveIndex={(index) => {}} lastStep={"Already Paid"} />}
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
                  <div className="h-fit flex flex-col justify-center items-center w-full mt-2 mx-auto">
                    <img
                      class="h-32 bg-transparent aspect-auto mx-auto mb-4"
                      src={successIcon}
                      alt=""
                    />
                    <p className="text-gray-800 font-semibold text-xl mb-1">Payment Already Made</p>
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
                    <FontAwesomeIcon icon={faCopy} title="copy" onClick={handleCopyClick} className="mb-1 hover:cursor-pointer" />
                  </div>

                  {/* Grid Layout for Payment Details */}
                  <div className="text-base grid grid-cols-2 md:grid-cols-2 gap-y-3 gap-x-6">
                    <p>Payment Amount</p>
                    <p className="text-2xl -mt-2">
                      {payment && payment.collectionAmountCurrency ? getSymbolFromCurrency(
                        payment.collectionAmountCurrency
                      ) : ""}{" "}
                      {payment && payment.finalDueAmount ? payment.finalDueAmount : ""}
                    </p>

                    {/* <p>Benepay Transaction Id</p>
                    <p className="">{payment && payment.requestorTransactionId ? payment.requestorTransactionId : ""}</p> */}

                    <p>Description</p>
                    <p className="">{payment && payment.reasonForCollection ? payment.reasonForCollection : "NA"}</p>

                    <p>Payment Timestamp</p>
                    <p className="">{payment && payment.paymentDate ? `${moment(payment.paymentDate, DateTimeFormats.dateTimeFormatymdthms).format(DateTimeFormats.dateTimeFormatdmyhms)} (${payment.timeZone})` : ""}</p>

                    <p>Reference</p>
                    <p className="truncate">{payment && payment.collectionReferenceNumber ? payment.collectionReferenceNumber : ""}</p>
                  </div>

                  <div className="grid grid-cols-1" style={{ marginTop: '3%' }}>
                    <div className="mb-8">
                      <button
                        // onClick={payByCard}
                        onClick={sendEmail}
                        className={`w-full bg-blue-600 text-white py-3 rounded-lg mt-3 hover:bg-blue-700 transition-all duration-200 ease-in-out flex justify-center items-center`}>
                        {isEmailProcessing && (
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              stroke-width="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        )}
                        <p>{false ? "Email Sent" : "Email Details"}</p>
                      </button>

                      <div
                        className="w-full bg-transparent text-gray-700 py-3 rounded-lg mb-2 flex justify-center items-center">
                        <p className="cursor-pointer hover:text-gray-800 transition-all ease-in-out duration-300" onClick={closeWindow}>Close Window</p>
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

export default connect(mapStateToProps)(PaymentAlreadyPaid);
