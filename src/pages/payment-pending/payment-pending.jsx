import React from "react";
import pendingIcon from "../../assets/pending.png";
import "../payment-pending/payment-pending.css";
import { connect } from "react-redux";
import AppHeader from "../../components/app-frame/app-header/app-header";
import { useLocation, useNavigate } from "react-router";
import getSymbolFromCurrency from "currency-symbol-map";


const PaymentPending = (props) => {
  const { device } = props;
  const { state } = useLocation();
  const { payment } = state || {};
  
  return (
    <div className="">
      <AppHeader username={payment.debtorName} />
      {device.scale === 1 || device.scale === 2 || device.scale === 3 ? (
        <>
        <div className="desktop payment-details-main mt-10 flex flex-col">
          <div className="payment-details-header flex w-full">
            <div className="merchant-logo flex items-center flex-1 pt-4">
              <img src={pendingIcon} className="w-10" />
              <strong className="md:text-3xl text-xl text-[#2f87f3] font-bold ml-3">
                Transaction Pending
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
          <div className="flex py-10">
            <div className="merchant-details flex flex-col text-lg">
              <div className=" flex items-center">
                <span className="text-sm sm:text-xl md:text-2xl font-medium">
                    Payment pending for &nbsp;
                </span>
                <img src={payment?.customerLogo} className="mx-w-100" />{" "}
                <b className="md:text-2xl sm:text-xl text-md">
                  {payment.merchantName}
                </b>
              </div>
                <p className="text-2xl my-6">Please DO NOT retry until confirmation is received from Bank.</p>
                <p className="text-2xl" >Reason : {payment.engineStatus ? payment.engineStatus : "Payment Pending. Please contact support@benepay.io for assistance"}  </p>
            </div>
          </div>
          <div className="payment-fail-actions flex my-12">
          </div>
        </div>
        </>
      ) : (
        <div className="payment-details-mobile pt-5 px-10 h-screen">
         {payment.poweredByBp && (<div className="flex justify-end">
            <div className="pb-benepay">
              <span className="text-sm">Powered by</span>
              <p className="text-xl">
                <b>BenePay</b>
              </p>
            </div>
          </div>)}
          <div className="transaction-details-mobile">
            <div className="mt-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex items-center flex-col pb-20 justify-center">
              <div className="flex items-center flex-col">
                <div className="flex flex-col items-center text-2xl">
                  <img src={pendingIcon} alt="pending-icon" className="pending-img mt-2" />
                  <div className="payment-success mt-4">
                    <span className="text-[#2f87f3] font-bold">Payment </span>
                    <span className="text-[#2f87f3] font-bold">Pending</span>
                  </div>
                </div>
                    <p className="text-[#2f87f3] text-center font-bold text-lg">for </p>
                <div className="flex-col text-center flex items-center p-5 merchant-mobile dark:bg-gray-600">
                  <div className="text-center flex items-center">
                    <img src={payment?.customerLogo} alt="" />
                    </div>
                    <div className="text-center flex items-center">
                    <b className="text-xl merchant-name dark:text-white">{payment?.merchantName}</b>
                  </div>
                  <div>
                    <h5 className="text-4xl font-bold text-purple-800 dark:text-white">
                    {getSymbolFromCurrency(payment.currency)}{" "}
                      {payment.amount}
                    </h5>
                  </div>
                </div>
              </div>
              <div className="merchant-details-mobile bg-purple-200 p-3 mx-8 rounded-lg text-xl">
                <div className="payment-id text-black-500">
                  <p>Please DO NOT retry until confirmation is received from Bank.</p>
                </div>
                <div className="text-black-500" style={{ marginTop : "17px"}}>
                  <p>Reason : {payment.engineStatus ? payment.engineStatus : "Payment Pending. Please contact support@benepay.io for assistance"} </p>
                </div>
                <div>
               {/* <p className="payment-id text-black-500" style={{ marginTop : "17px"}}>You will be automatically redirected to the Payment page in {countdown} seconds. You can retry making the payment from there.</p> */}
              </div>
              </div>
            </div>
          </div>
          <div className="pay-now mt-10 pb-10">
            {/* <button className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full w-full" onClick={() => navigate(`/?token=${payment.transactionReference}`)}>
              Try again
            </button> */}
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

export default connect(mapStateToProps)(PaymentPending);
