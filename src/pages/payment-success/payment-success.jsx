import React, { useEffect, useState } from "react";
import successIcon from "../../assets/success-icon.png";
import merchantLogo from "../../assets/robotic-school.png";
import "./payment-success.css";
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

const PaymentSuccess = (props) => {
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



  const [showCopiedMsg, setShowCopiedMsg] = useState(false)
  console.log("payment",payment);
  const closeWindow = () => {
    window.open(commonRedirectUrl, '_self');
    // window.close();
  }

  const handleCopyClick = async () => {

    setShowCopiedMsg(true)
    if (!showCopiedMsg) {
      setTimeout(() => {
        setShowCopiedMsg(false)
      }, 500);
    }

    const valuesToCopy = [
      getSymbolFromCurrency(payment.currency),
      payment.amount,
      payment.transactionReference,
      payment.traceId,
      payment.paymentTime,
      payment.reasonForCollection,
      payment.customerReference,
      payment.paymentMode
    ];
    const labels = [
      "Amount : ",
      "",
      "Bene Transaction ID : ",
      "Payment Confirmation ID : ",
      "Payment made on : ",
      "Towards : ",
      "Reference : ",
      "Payment Mode : "
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

  const toCamelCase = (str) => {
    if (!str) return '';

    // Split the string into words
    const words = str.split(/\s+/);

    // Capitalize the first letter of each word and make the rest of the letters lowercase
    return words.map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
   
  };


  const navigateToPayment = () =>{
    navigate('/?token='+ payment.transactionReference);
  }


  return (
    <div className="">
      <AppHeader username={payment.debtorName} />
      {device.scale === 1 || device.scale === 2 || device.scale === 3 ? (
        <>
          <div className="desktop payment-details-main mt-10 flex flex-col">
            <div className="payment-details-header flex w-full">
              <div className="merchant-logo flex items-center flex-1 pt-4">
                <img src={successIcon} className="sm:w-12 w-10" />
                <strong className="md:text-3xl text-xl text-green-600 font-bold ml-3">
                  Transaction Successful
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
            <div className="flex pb-5 pt-4">
              <div className="merchant-details flex flex-col text-lg">
                <div className=" flex items-center">
                  <span className="text-sm sm:text-xl md:text-2xl font-medium">
                    Payment successfully made to
                  </span>{" "}
                  <img
                    src={payment.customerLogo}
                    style={{ maxWidth: "100px" }}
                    className="mx-2"
                  />{" "}
                  <b className="md:text-2xl sm:text-xl text-md">
                    {payment.merchantName}
                  </b>
                </div>
              </div>
            </div>
            <div className="flex">
              <div className="" style={{ width: "98%" }}>
                <div className="dark:text-white p-6 bg-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                  <div>
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-purple-800  dark:text-white" style={{ position: "relative" }}>
                      Transaction Details

                      {showCopiedMsg && (
                        <span id="copiedTextDesktop">{"Copied!"}</span>
                      )}
                      <FontAwesomeIcon icon={faCopy} title="copy" id="copyIconContainerDesktop" onClick={handleCopyClick} />
                    </h5>
                  </div>
                  <div
                    className="divider bg-purple-900 w-full"
                    style={{ height: "1.5px" }}
                  ></div>
                  <div className="transaction-details my-5">
                    <div class="grid xl:grid-cols-3 lg:grid-cols-3 xl:gap-4">
                      <div className="transaction-details my-3 col-span-2">
                        <table>
                          <tbody>
                            <tr className="lg:h-24 md:h-20 h-16">
                              <td className="w-50">Amount</td>
                              <td id="paymentAmountDesktop">
                                <b className="lg:text-6xl md:text-5xl sm:text-2xl text-xl">
                                  {getSymbolFromCurrency(
                                    payment.currency
                                  )}{" "}
                                  {payment.amount}
                                </b>
                              </td>
                            </tr>
                            <tr className="h-10">
                              <td className="w-50">Bene Transaction ID</td>
                              <td>
                                <b>{payment.transactionReference}</b>
                              </td>
                            </tr>
                            <tr className="h-10">
                              <td className="w-50">Payment Confirmation ID</td>
                              <td>
                                <b>{payment.traceId}</b>
                              </td>
                            </tr>
                            <tr className="h-10">
                              <td className="w-50">Payment made on</td>
                              <td>                                
                              <b>{payment.paymentTime}</b>
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
                                <b>{(payment.customerReference).toLowerCase()}</b>
                              </td>
                            </tr>
                            <tr className="h-10">
                              <td className="w-50">Payment Mode</td>
                              <td>
                                <b>{payment.cardBrand ? toCamelCase(payment.cardBrand) + " " + toCamelCase(payment.paymentMode) : toCamelCase(payment.paymentMode)}</b>
                              </td>

                            </tr>

                          </tbody>
                        </table>
                      </div>

                      <div>
                        <PaymentList transactionId={payment.transactionReference} lastTxn={false}/>
                      </div>
                    </div>
                  </div>
                  {payment.emailFlag && (
                    <span>
                      <FontAwesomeIcon icon={faCircleInfo} style={{ margin: "0px 0px -24px 3px", color: "blueviolet" }} />
                      <p style={{ margin: "0px 0px 0px 30px" }}>Transaction Details emailed to  {payment.payerEmail} </p>
                    </span>
                  )
                  }
                </div>
              </div>
            </div>

            <div className="trasaction-actions flex my-12">  
            {payment.allowPartialPayments === true && payment.partiallyPaid === true && payment.remainingAmount !== 0 ?           
              <div className="pay-with-card flex-1">
                <button className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-20 px-8" onClick={navigateToPayment}>
                  Make Another Payment
                </button>
              </div>
              :''}

              <div className="pay-with-card flex-1">
                <button className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-20 px-8" onClick={closeWindow}>
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="payment-details-mobile pt-5 px-10 h-screen">
          {payment.poweredByBp && <div className="flex justify-end">
            <div className="pb-benepay">
              <span className="text-sm">Powered by</span>
              <p className="text-xl">
                <b>BenePay</b>
              </p>
            </div>
          </div>}
          {/* <div className="payment-details-header mt-4">
            <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
              <div className="payment-requester-details">
                <div className="flex">
                  <div className="payment-request-logo">
                    <img src={paymentRequestLogo} alt="" className="w-12" />
                  </div>
                  <div className="requester-name pl-5">
                    <h5 className="text-xl">
                      <b>Payment Request</b>
                    </h5>
                    <p className="text-sm">
                      <b>{payment.debtorName}</b>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
          <div className="transaction-details-mobile dark:text-white">
            <div className="mt-6 bg-white dark:text-white rounded-lg dark:bg-gray-800 dark:border-gray-700 flex items-center flex-col pb-10 justify-center">
              <div className="flex items-center flex-col">
                <div className="flex flex-col items-center text-2xl">
                  <img src={successIcon} alt="" className="mt-5" />
                  <div className="payment-success mt-4">
                    <span className="font-bold">Payment </span>
                    <span className="text-green-600 font-bold">Successful</span>
                    <span className="pl-2 text-center font-bold text-lg">to</span>
                  </div>
                </div>
                
                <div className="flex-col text-center flex items-center p-5 merchant-mobile dark:bg-gray-600">
                  <div className="text-center flex items-center">
                    <img src={payment.customerLogo} alt="" className="merchant-logo-mobile" />
                    <b className="text-xl merchant-name ml-3 dark:text-white">{payment.merchantName}</b>
                  </div>
                  <div id="paymentAmountMobile">
                    <h5 className="text-4xl font-bold text-purple-800 dark:text-white">
                      {getSymbolFromCurrency(
                        payment.currency
                      )}{" "}
                      {payment.amount}
                    </h5>
                    <div id="copyIconContainerMobile">
                      {showCopiedMsg && (
                        <span id="copiedTextMobile">{"Copied!"}</span>
                      )}
                      <span title="copy" > <FontAwesomeIcon id="copyIconMobile" icon={faCopy} onClick={handleCopyClick} /> </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="merchant-details-mobile bg-purple-200 p-3 rounded-lg dark:text-white dark:bg-gray-600" style={{ width: '17rem' }}>
                <div className="payment-ref pb-4  break-words">
                  <p>Bene Transaction ID</p>
                  <p>{payment.transactionReference}</p>
                </div>
                <div className="payment-id break-words">
                  <p>Payment Confirmation ID</p>
                  <p>{payment.traceId}</p>
                </div>

                <div className="mt-5">
                  <PaymentList transactionId={payment.transactionReference} lastTxn={false} />
                </div>
              </div>
            </div>

            {payment.emailFlag &&
              <div>
                <FontAwesomeIcon icon={faCircleInfo} style={{ margin: "33px 9px 0px 22px", color: "blueviolet" }} />
                <p style={{ margin: "-24px 0px 42px 52px", color: "black" }}>Transaction Details sent to {payment.payerEmail}</p>
              </div>}
          </div>
          <div className="pay-now pb-10">
            {
              payment.allowPartialPayments === true && payment.partiallyPaid === true && payment.remainingAmount !== 0 ?           
                <div className="pay-with-card flex-1">
                  <button className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 mb-5 rounded-full md:px-20 px-8 w-full" onClick={navigateToPayment}>
                    Make Another Payment
                  </button>
                </div>
                :''
            }

            <button className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full w-full" onClick={closeWindow}>
              Close Window
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

export default connect(mapStateToProps)(PaymentSuccess);
