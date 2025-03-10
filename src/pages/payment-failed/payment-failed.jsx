import React,  { useState, useEffect }  from "react";
import closeIcon from "../../assets/close.png";
import merchantLogo from "../../assets/robotic-school.png";
import "./payment-failed.css";
import mrcVisaLogo from "../../assets/visa-mastercard-logo.png";
import cardsLogo from "../../assets/cards.png";
import paymentRequestLogo from "../../assets/payment-request.svg";
import InfoIcon from "../../assets/info.png";
import { connect } from "react-redux";
import AppHeader from "../../components/app-frame/app-header/app-header";
import { useLocation, useNavigate } from "react-router";
import getSymbolFromCurrency from "currency-symbol-map";
import { commonRedirectUrl, baseUiUrl } from "../../config/urlConfig";


const PaymentFailed = (props) => {
  const { device } = props;
  const { state } = useLocation();
  const { payment } = state || {};
  const navigate = useNavigate();

  const closeWindow = () => {
    window.open(commonRedirectUrl, '_self');
    window.close();
  }

  const openPaymentPage = (token) => {
    if(token){
      window.open(`${baseUiUrl}?token=${token}`, '_self');
      window.close();
    }
  }

  const [countdown, setCountdown] = useState(20); // Initialize countdown state

  useEffect(() => {
    const countdownInterval = setInterval(() => {
      setCountdown(prevCountdown => prevCountdown - 1);
    }, 1000);

    // Clear the interval when countdown reaches 0
    if (countdown === 0) {
      clearInterval(countdownInterval);
      openPaymentPage(payment.transactionReference);
    }

    return () => clearInterval(countdownInterval); // Cleanup on component unmount
  }, [countdown]);
  
  return (
    <div className="">
      <AppHeader username={payment.debtorName} />
      {device.scale === 1 || device.scale === 2 || device.scale === 3 ? (
        <>
        <div className="desktop payment-details-main mt-10 flex flex-col">
          <div className="payment-details-header flex w-full">
            <div className="merchant-logo flex items-center flex-1 pt-4">
              <img src={closeIcon} className="w-10" />
              <strong className="md:text-3xl text-xl text-[#f32f45] font-bold ml-3">
                Transaction Failed
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
                  Oops! Payment failed for
                </span>{" "}
                <img src={payment?.customerLogo} className="mx-w-100" />{" "}
                <b className="md:text-2xl sm:text-xl text-md">
                  {payment.merchantName}
                </b>
              </div>
                <p className="text-2xl my-6">Money was NOT debited from your account.</p>
                <p className="my-1 text-2xl">Please retry using same or alternative mechanism</p>
                <p className="text-2xl my-6" >Reason for failure : {payment.engineStatus ? payment.engineStatus : "Something went wrong. Please contact support@benepay.io for assistance"}  </p>
            </div>
          </div>
          <div>
          <p className="text-2xl ">You will be automatically redirected to the Payment page in {countdown} seconds. You can retry making the payment from there.</p>
          </div>
          <div className="payment-fail-actions flex my-12">
            {/* <div className="pay-with-card flex-1">
              <button className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-28 px-16" onClick={() => navigate(`/?token=${payment.transactionReference}`)}>
                Try Again
              </button>
            </div> */}
            {/* <div className="pay-with-card flex-1">
              <button className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-28 px-16" onClick={() => closeWindow()}>
                Close Window
              </button>
            </div> */}
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
            <div className="mt-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700 flex items-center flex-col pb-20 justify-center">
              <div className="flex items-center flex-col">
                <div className="flex flex-col items-center text-2xl">
                  <img src={closeIcon} alt="" className="mt-5" />
                  <div className="payment-success mt-4">
                    <span className="font-bold">Payment </span>
                    <span className="text-[#f32f45] font-bold">Failed</span>
                  </div>
                </div>
                    <p className="text-center font-bold text-lg">for</p>
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
                <div className="payment-ref pb-4 text-black-500">
                  <p>Money was not debited from your account.</p>
                </div>
                <div className="payment-id text-black-500">
                  <p>Please retry using same or alternative mechanism</p>
                </div>
                <div className="text-black-500" style={{ marginTop : "17px"}}>
                  <p>Reason for failure : {payment.engineStatus} </p>
                </div>
                <div>
               <p className="payment-id text-black-500" style={{ marginTop : "17px"}}>You will be automatically redirected to the Payment page in {countdown} seconds. You can retry making the payment from there.</p>
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

export default connect(mapStateToProps)(PaymentFailed);
