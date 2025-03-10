import React from "react";
import expiredIcon from "../../assets/expired.png";
import merchantLogo from "../../assets/robotic-school.png";
import "./payment-expired.css";
import mrcVisaLogo from "../../assets/visa-mastercard-logo.png";
import cardsLogo from "../../assets/cards.png";
import paymentRequestLogo from "../../assets/payment-request.svg";
import InfoIcon from "../../assets/info.png";
import { connect } from "react-redux";
import { useLocation } from "react-router";
import getSymbolFromCurrency from "currency-symbol-map";
import AppHeader from "../../components/app-frame/app-header/app-header";
import moment from "moment";
import { commonRedirectUrl } from "../../config/urlConfig";

const PaymentExpired = (props) => {
  const { device } = props;
  const { state } = useLocation();
  const { payment } = state || {};
  console.log("payment ", payment);

  const closeWindow = () => {
    window.open(commonRedirectUrl, '_self');
    // window.close();
  };
  return (
    <div className="">
      <AppHeader username={payment.debtorName} />
      {device.scale === 1 || device.scale === 2 || device.scale === 3 ? (
        <>
          <div className="desktop payment-details-main mt-10 flex flex-col">
            <div className="payment-details-header flex w-full">
              <div className="merchant-logo flex items-center flex-1 pt-4">
                <img src={expiredIcon} className="w-10" />
                {/* text-[#E91C1C]  */}
                <strong className="md:text-3xl text-xl font-medium ml-3">
                  Payment link Expired
                </strong>
              </div>
              {payment.poweredByBp && (
                <div className="pb-benepay-text flex items-center">
                  <p className="pt-5">
                    Powered by
                    <br />
                    <span className="text-xl">BenePay</span>
                  </p>
                </div>
              )}
            </div>
            <div className="seprator h-1 bg-purple-800 mt-3"></div>
            <div className="flex pb-2 pt-4">
              <div className="merchant-details flex flex-col text-lg">
                <p className="text-2xl mb-2 mt-3">
                Please contact <span className="text-sky-700 underline">{payment.merchantName}</span> to arrange for a payment. You can quote below details
                </p>
              </div>
            </div>
            {/* </div> */}
            <div className="transaction-details my-3">
              <div>
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-purple-800">
                  Details
                </h5>
              </div>
              <div
                className="divider bg-purple-900 w-full"
                style={{ height: "1.7px" }}
              ></div>
              <table className="my-6 ">
                <tbody>
                  <tr className="h-10">
                    <td className="w-50">Amount Requested</td>
                    <td>
                      <b>{getSymbolFromCurrency(
                                payment.collectionAmountCurrency
                              )}{" "}
                              {payment.finalDueAmount}</b>
                    </td>
                  </tr>
                  <tr className="h-10">
                    <td className="w-50">Description</td>
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
                  <tr className="h-10">
                    <td className="w-50">Expired On</td>
                    <td>
                      <b>{payment.finalDueDate && moment(payment.finalDueDate).format("DD-MM-YYYY")}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="payment-expired-actions my-4">
              <div className="pay-with-card">
                <button
                  className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-28 px-16"
                  onClick={closeWindow}
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
          <div className="transaction-details-mobile">
            <div className=" bg-white rounded-lg flex items-center flex-col justify-center">
              <div className="flex items-center flex-col">
                <div className="flex flex-col items-center text-2xl">
                  <img src={expiredIcon} alt="" className="mt-5" />
                  <div className="payment-success mt-4">
                    <span className="font-bold">Payment link Expired </span>
                  </div>
                </div>
                <p className="text-center font-noraml text-md py-5">Please contact <span className="text-sky-700 underline">{payment.merchantName}</span> to arrange for a payment. You can quote below details</p>
                {/* <div className="flex-col text-center flex items-center p-5 merchant-mobile"> */}
                  {/* <div className="text-center flex items-center">
                    <img
                      src={payment.merchantLogoUrl}
                      alt=""
                      className="merchant-logo-mobile"
                    />
                    <b className="text-xl ml-3 merchant-name">
                      {payment.merchantName}
                    </b>
                  </div> */}
                  {/* <div>
                    <h5 className="text-4xl font-bold text-purple-800">
                      &#x20b9; 1240.78
                    </h5>
                  </div> */}
                {/* </div> */}
              </div>
              <div
                className="merchant-details-mobile bg-purple-200 p-3 mx-8 rounded-lg text-xl dark:text-white dark:bg-gray-600"
                style={{ width: "20rem", fontSize: '16px' }}
              >
                <div className="payment-ref pb-4 text-black-500 underline">
                  <p>Original Payment Request Details</p>
                </div>
                <div className="payment-id text-black-500">
                  <p>Amount Requested -         {getSymbolFromCurrency(
                                payment.collectionAmountCurrency
                              )}{" "}
                              {payment.finalDueAmount}</p>
                </div>
                <div className="payment-ref">
                  <span>Description - {payment.reasonForCollection}</span>
                </div>
                <div className="payment-ref">
                  <span>Reference - {payment.collectionReferenceNumber}</span>
                </div>
                <div className="payment-ref">
                  <span>Expired On - {payment.finalDueDate}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="pay-now mt-10 pb-10">
            <button
              className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full w-full"
              onClick={closeWindow}
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

export default connect(mapStateToProps)(PaymentExpired);
