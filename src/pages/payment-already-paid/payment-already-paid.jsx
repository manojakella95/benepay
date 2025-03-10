import React, { useState } from "react";
import paymentInfoIcon from "../../assets/payment-info.png";
import merchantLogo from "../../assets/robotic-school.png";
import "./payment-already-paid.css";
import mrcVisaLogo from "../../assets/visa-mastercard-logo.png";
import cardsLogo from "../../assets/cards.png";
import paymentRequestLogo from "../../assets/payment-request.svg";
import InfoIcon from "../../assets/info.png";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import getSymbolFromCurrency from "currency-symbol-map";
import AppHeader from "../../components/app-frame/app-header/app-header";
import { PaymentService } from "../../service/api/payment.service";
import { toast } from "react-toastify";
import moment from "moment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { commonRedirectUrl } from "../../config/urlConfig";

const PaymentAlreadyPaid = (props) => {
  const { device } = props;
  const [isEmailProcessed, setEmailProcessed] = useState(false);
  const { state } = useLocation();
  const { payment } = state || {};
  const navigate = useNavigate();
  console.log("state ", state);
  // const [showCopiedMsg, setShowCopiedMsg] = useState(false);
  const [isEmailShow, setEmailShow] = useState(true);
  const [emailNotification, setEmailNotification] = useState(false);

  const closeWindow = () => {
    window.open(commonRedirectUrl, '_self');
    // window.close();
  };
  const handleCopyClick = async () => {

    // setShowCopiedMsg(true)
    // if (!showCopiedMsg) {
    //   setTimeout(() => {
    //     setShowCopiedMsg(false)
    //   }, 500);
    // }

    const valuesToCopy = [
      getSymbolFromCurrency(payment.collectionAmountCurrency),
      payment.finalDueAmount,
      payment.requestorTransactionId,
      payment.beneId,
      payment.paymentDate,
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
    setEmailProcessed(true);
    console.log("payment ", payment);
    const emailResponse = await PaymentService.sendEmail(
      payment?.requestorTransactionId
    );
    setEmailProcessed(false);
    console.log("emailResponse ", emailResponse);
    if (emailResponse && emailResponse.status === 500) {
      toast.error("Something went wrong! Please again later");
      return;
    }
    toast.info("Email sent successfully");
    setEmailShow(false)
    setEmailNotification(true)
  };

  return (
    <div className="">
      <AppHeader username={payment.debtorName} />
      {device.scale === 1 || device.scale === 2 || device.scale === 3 ? (
        <>
          <div className="desktop payment-details-main mt-10 flex flex-col">
            <div className="payment-details-header flex w-full">
              <div className="merchant-logo flex items-center flex-1 pt-4">
                <img src={paymentInfoIcon} className="sm:w-12 w-10" />
                <strong className="md:text-3xl text-xl text-green-600 font-bold ml-3">
                  Payment Already Made
                </strong>
              </div>
              {payment.poweredByBp && (<div className="pb-benepay-text flex items-center">
                <p className="pt-5">
                  Powered by
                  <br />
                  <span className="text-xl">BenePay</span>
                </p>
              </div>)}
            </div>
            <div className="seprator h-1 bg-purple-800 mt-3"></div>
            <div className="flex pt-1">
              <div className="merchant-details flex flex-col text-lg">
                <div className=" flex items-center my-2">
                  <span className="text-sm sm:text-xl md:text-2xl font-medium">
                    Payment already made to
                  </span>{" "}
                  <img
                    src={payment.merchantLogoUrl}
                    style={{ maxWidth: "100px" }}
                    className="mx-2"
                  />{" "}
                  <b className="md:text-2xl sm:text-xl text-md">
                    {payment && payment.merchantName}
                  </b>
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="" style={{ width: "98%" }}>
                <div className="dark:text-white p-6 py-2 bg-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <div>
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-purple-800  dark:text-white">
                      Transaction Details
                      <FontAwesomeIcon icon={faCopy} title="copy" onClick={handleCopyClick} style={{ cursor: "pointer", position: "absolute", right: "22%", height: "30px", width: "30px" }} />
                    </h5>
                  </div>
                  <div
                    className="divider bg-purple-900 w-full"
                    style={{ height: "1.5px" }}
                  ></div>
                  <div className="transaction-details my-2">
                    <table>
                      <tbody>
                        <tr className="h-20">
                          <td className="w-50">Amount</td>
                          <td>
                            <b className="lg:text-6xl md:text-5xl sm:text-2xl text-xl">
                              {getSymbolFromCurrency(
                                payment.collectionAmountCurrency
                              )}{" "}
                              {payment.finalDueAmount}
                            </b>
                          </td>
                        </tr>
                        <tr className="h-10">
                          <td className="w-50">Bene Transaction ID</td>
                          <td>
                            <b>{payment.requestorTransactionId}</b>
                          </td>
                        </tr>
                        {/* <tr className="h-10">
                          <td className="w-50">Payment confirmation ID</td>
                          <td>
                            <b>{payment.beneId}</b>
                          </td>
                        </tr> */}
                        <tr className="h-10">
                          <td className="w-50">Payment made on</td>
                          <td>
                           { 
                            payment.paymentDate && 
                            <b>
                              {moment(payment.paymentDate.replace("T"," ").replace(/\.\d+/,"")).format("DD/MM/YYYY hh:mm:ss")}
                              &nbsp;({payment.timeZone})
                            </b> 
                            }
                          </td>
                        </tr>
                        <tr className="h-10">
                          <td className="w-50">Towards</td>
                          <td>
                            <b>{payment.reasonForCollection}</b>
                          </td>
                        </tr>
                        <tr className="h-10">
                          <td className="w-50">Reference</td>
                          <td>
                            <b>{payment.collectionReferenceNumber}</b>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div></div>
            </div>
            <div className="trasaction-actions flex my-6">
              {payment.notificationEnable && <div className="pay-with-card flex-1">
                <button
                  className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-20 px-8 flex items-center justify-center"
                  onClick={sendEmail}
                >
                  {isEmailProcessed && (
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
                  Email Information
                </button>
              </div>}
              <div className="pay-with-card mx-2">
                <button
                  className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-20 px-8"
                  onClick={() => closeWindow()}
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="payment-details-mobile pt-5 px-10 h-screen">
          {payment.poweredByBp && (
            <div className="flex justify-end">
              <div className="pb-benepay">
                <span className="text-sm">Powered by</span>
                <p className="text-xl">
                  <b>BenePay</b>
                </p>
              </div>
            </div>
          )}
          {/* <div className="payment-details-header mt-4">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
              <div className="payment-requester-details">
                <div className="flex">
                  <div className="payment-request-logo">
                    <img src={paymentRequestLogo} alt="" className="w-12" />
                  </div>
                  <div className="requester-name pl-5">
                    <h5 className="text-xl">
                      <b>Payment Requester</b>
                    </h5>
                    <p className="text-sm">
                      <b>{payment.merchantName}</b>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
          <div className="transaction-details-mobile dark:text-white">
            <div className="mt-6 bg-white dark:text-white rounded-lg dark:bg-gray-800 dark:border-gray-700 flex items-center flex-col pb-20 justify-center">
              <div className="flex flex-col">
                <div className="flex flex-col items-center text-2xl">
                  <img src={paymentInfoIcon} alt="" className="mt-5 w-12" />
                  <div className="payment-success mt-4">
                    <span className="font-bold">Payment </span>
                    <span className="text-green-600 font-bold">
                      Already made
                    </span>
                  </div>
                </div>
                <p className="text-center font-bold text-lg">to</p>
                <div className="flex-col text-center flex items-center p-2 px-5 merchant-mobile dark:bg-gray-600">
                  <div className="text-center flex items-center">
                    <img
                      src={payment.merchantLogoUrl}
                      alt=""
                      className="merchant-logo-mobile"
                    />
                    <b className="text-xl merchant-name ml-3 max-w-12 dark:text-white">
                      {payment.merchantName} <br />
                      <p className="text-purple-800 dark:text-white text-left text-4xl my-1">
                        {getSymbolFromCurrency(
                          payment.collectionAmountCurrency
                        )}{" "}
                        {payment.finalDueAmount}
                      </p>
                    </b>
                  </div>
                  <div>
                    <h5 className="text-3xl font-bold text-purple-800"></h5>
                  </div>
                </div>
              </div>
              <div
                className="merchant-details-mobile bg-purple-100 p-3 rounded-lg mt-3 dark:text-white dark:bg-gray-600"
                style={{ width: "17rem" }}
              >
                <span>
                  <FontAwesomeIcon icon={faCopy} title="copy" onClick={handleCopyClick} style={{ cursor: "pointer", position: "absolute", right: "17%", top: "457px", height: "30px", width: "30px" }} />
                </span>

                <div>
                  <div className="payment-ref pb-4 text-gray-600 break-words dark:text-white">
                    <p className="mb-3 text-black dark:text-white" style={{ margin : "0px 31px 13px 0px"}}>
                      Payment was successfully made on{" "}
                      {moment(payment.paymentDate).format("DD-MM-YYYY")}
                    </p>
                    <p>Bene Transaction ID - </p>
                    <p>{payment.requestorTransactionId}</p>
                  </div>
                  <div className="payment-id text-gray-600 break-words dark:text-white">
                    <p>Payment confirmation ID - </p>
                    <p>{payment.beneId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pay-now mt-4 pb-10">
            {emailNotification &&
              <div>
                <FontAwesomeIcon icon={faCircleInfo} style={{ margin: "0px 0px 1px 30px", color: "blueviolet" }} />
                <p style={{ margin: "-25px 0px 42px 52px", color: "black" }}>Transaction Details sent to {payment.debtorEmailId}</p>
              </div>}
            <button
              className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full w-full flex items-center justify-center"
              onClick={isEmailShow ? sendEmail : closeWindow}
            >
              {isEmailProcessed && (
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
              {isEmailShow ? 'Email Information' : 'Close Window'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    device: state.device,
  };
};

export default connect(mapStateToProps)(PaymentAlreadyPaid);
