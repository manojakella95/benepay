import React, { useEffect, useState } from "react";
import paymentInfoIcon from "../../assets/payment-info.png";
import merchantLogo from "../../assets/robotic-school.png";
import "./payment-refund-issued.css";
import mrcVisaLogo from "../../assets/visa-mastercard-logo.png";
import cardsLogo from "../../assets/cards.png";
import paymentRequestLogo from "../../assets/payment-request.svg";
import InfoIcon from "../../assets/info.png";
import { connect } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import getSymbolFromCurrency from "currency-symbol-map";
import AppHeader from "../../components/app-frame/app-header/app-header";
import moment from "moment";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { commonRedirectUrl } from "../../config/urlConfig";

const PaymentRefundIssued = (props) => {
  const { device } = props;
  const { state } = useLocation();
  const { payment } = state || {};
  const navigate = useNavigate();
  // const [showCopiedMsg, setShowCopiedMsg] = useState(false);

  const closeWindow = () => {
    window.open(commonRedirectUrl, '_self');
    // window.close();
  }

  const handleCopyClick = async () => {

    // setShowCopiedMsg(true)
    // if (!showCopiedMsg) {
    //   setTimeout(() => {
    //     setShowCopiedMsg( false )
    //   }, 500);
    // }

    const valuesToCopy = [
      getSymbolFromCurrency(payment.refundCcy),
      payment.refundAmount,
      moment(payment.refundDate).format("DD MMM YYYY"),
      payment.refundDetail ? payment.refundDetail : 'NA',
      getSymbolFromCurrency(payment.refundCcy),
      payment.refundAmount,
      moment(payment.refundDate).format("DD MMM YYYY"),
      payment.refundDetail
     
    ];
    const labels = [
      "Refund Amount : ",
      "",
      "Refund Date : ",
      "Details : ",
      "Originla Payment Amount : ",
      "",
      "Payment Date : ",
      "Details : "
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


  console.log("state ", state);
  return (
    <div className="dark:text-white">
      <AppHeader username={payment.debtorName} />
      {device.scale === 1 || device.scale === 2 || device.scale === 3 ? (
        <>
        <div className="desktop payment-details-main mt-10 flex flex-col">
          <div className="payment-details-header flex w-full mt-4">
            <div className="merchant-logo flex items-center flex-1 pt-4">
              <img src={paymentInfoIcon} className="sm:w-12 w-10" />
              <strong className="md:text-3xl text-xl text-green-600 font-bold ml-3">
                Refund Issued
              </strong>
            </div>
            <div className="pb-benepay-text flex items-center">
              <p className="pt-5">
                Powered by
                <br />
                <span className="text-xl">BenePay</span>
              </p>
            </div>
          </div>
          <div className="seprator h-1 bg-purple-800 mt-3"></div>
          <div className="flex py-3">
            <div className="merchant-details flex flex-col text-lg">
              <div className=" flex items-center my-3">
                <span className="text-sm sm:text-xl md:text-2xl">
                  A refund has been issued by
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
              <div className="p-6 bg-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                <div>
                  <h5 className="mb-2 text-3xl font-bold tracking-tight text-purple-800  dark:text-white">
                    Details
                    <FontAwesomeIcon icon={faCopy} title="copy" onClick={handleCopyClick} style={{ cursor: "pointer", position: "absolute", right: "23%", height: "30px", width: "30px" }} />
                  </h5>
                </div>
                <div
                  className="divider bg-purple-800 w-full"
                  style={{ height: "1.6px" }}
                ></div>
                <div className="transaction-details my-2">
                  <table>
                    <tbody>
                      <tr className="h-20">
                        <td className="w-50">Amount Refunded</td>
                        <td>
                          <b className="lg:text-6xl md:text-5xl sm:text-2xl text-xl">
                            {getSymbolFromCurrency(payment.refundCcy)}{" "}
                            {payment.refundAmount}
                          </b>
                        </td>
                      </tr>
                      <tr className="h-10">
                        <td className="w-50">Date of Refund</td>
                        <td>
                          <b>
                            {moment(payment.refundDate).format("DD-MM-YYYY")}
                          </b>
                        </td>
                      </tr>
                      <tr className="h-10">
                        <td className="w-50">Details</td>
                        <td>
                          <b>{payment.refundDetail ? payment.refundDetail : 'NA'}</b>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="original-payment-details my-5">
                    <h5 className="underline font-semibold">
                      Original Payment Details
                    </h5>
                    <p className="my-4">
                      You paid {getSymbolFromCurrency(payment.collectionAmountCurrency)}{" "}
                      {payment.finalDueAmount} on{" "}
                      {moment(payment.paymentDate).format("DD-MM-YYYY")} for{" "}
                      {payment.reasonForCollection}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div></div>
          </div>
          <div className="trasaction-actions flex my-12">
            <div className="pay-with-card flex-1">
              <button
                className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-20 px-8"
                onClick={() =>
                  closeWindow()
                }
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
        </>
      ) : (
        <div className="payment-details-mobile pt-2 px-10 h-screen">
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
          <div className="transaction-details-mobile">
            <div className=" bg-white rounded-lg  dark:bg-gray-800 dark:border-gray-700 flex items-center flex-col justify-center">
              <div className="flex flex-col">
                <div className="flex flex-col items-center text-2xl">
                  <img src={paymentInfoIcon} alt="" className=" w-12" />
                  <div className="payment-success mt-4">
                    <span className="text-green-600 font-bold">
                      Refund Issued
                    </span>
                  </div>
                </div>
                <p className="text-center font-bold text-lg">by</p>
                <div className="flex-col text-center flex items-center p-2 px-5 merchant-mobile">
                  <div className="text-center flex items-center">
                    <img
                      src={payment.merchantLogoUrl}
                      alt=""
                      className="merchant-logo-mobile"
                    />
                    <b className="text-xl merchant-name ml-3 my-2 max-w-12">
                      {payment.merchantName} <br />
                      <p className="text-purple-800 dark:text-white text-left text-4xl">
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
                className="refund-merchant-details-mobile bg-purple-100 p-3 rounded-lg dark:text-white dark:bg-gray-600"
                style={{ width: "18rem" }}
              >
                 <span> 
                     <FontAwesomeIcon icon={faCopy} title="copy" onClick={handleCopyClick} style={{ cursor: "pointer", position: "absolute", right: "16%", height: "30px", width: "30px" }} />
                 </span>
                <div className="payment-refund pb-4">
                  
                  <div className="refund-details">
                   
                <p className="underline">Refund Details </p>
                <p>Refund Date - {moment(payment.refundDate).format(
                                "DD-MM-YYYY"
                              )}</p>
                 <p>Details - {payment.refundDetail}</p>             
                 </div>
                 <div className="original-payment-details mt-3">
                 <p className="underline">Original Payment Details</p>
                  <p>You paid  {getSymbolFromCurrency(
                          payment.collectionAmountCurrency
                        )}{" "}
                        {payment.finalDueAmount} on {moment(payment.paymentDate).format(
                                "DD-MM-YYYY"
                              )} for "{payment.reasonForCollection}"</p>
                 </div>
              </div>
              </div>
            </div>
          </div>
          <div className="pay-now py-10">
            <button
              className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full w-full"
              onClick={() =>
                closeWindow()
              }
            >
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

export default connect(mapStateToProps)(PaymentRefundIssued);
