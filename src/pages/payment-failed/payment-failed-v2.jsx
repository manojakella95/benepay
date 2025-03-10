import React, { useEffect, useState } from "react";
import "./payment-failed.css";
import { connect } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import LocationService from "../../service/api/location.service";
import { PaymentService } from "../../service/api/payment.service";
import Layout from "../seamless-payment-page/layout";
import HorizontalNonLinearStepper from "../seamless-payment-page/layout/stepper";
import benepayLogo from "../seamless-payment-page/layout/asset/benepay-transperent.png";
import { Alert } from "@mui/material";
import closeIcon from "../../assets/close.png";

const PaymentFailed = (props) => {
  const { device } = props;
  const { state } = useLocation();
  const navigate = useNavigate();
  const { payment, redirection } = state || {};

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

  const navigateToPayment = () => {
    navigate('/?token=' + payment.transactionReference);
  }

  const [countdown, setCountdown] = useState(20); // Initialize countdown state

  useEffect(() => {
    if (!redirection) {
      const countdownInterval = setInterval(() => {
        setCountdown(prevCountdown => prevCountdown - 1);
      }, 1000);

      // Clear the interval when countdown reaches 0
      if (countdown === 0) {
        clearInterval(countdownInterval);
        navigateToPayment();
      }

      return () => clearInterval(countdownInterval);
    }// Cleanup on component unmount
  }, [countdown]);

  return (
    <>
      <Layout
        headerLogo={payment.customerLogo}
        headerChildren={<HorizontalNonLinearStepper skipOtherActiveindex={true} activeIndex={1} setActualActiveIndex={(index) => { }} lastStep={"Failed"} />}
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
                  <Alert severity="info" className="mb-1">Money was not debited from your account.</Alert>
                  <Alert severity="info">Please retry using same or alternative mechanism.</Alert>
                  <div className="h-fit flex flex-col justify-center items-center w-full mt-6 mx-auto">
                    <img
                      class="h-32 bg-transparent aspect-auto mx-auto mb-4"
                      src={closeIcon}
                      alt=""
                    />
                    <p className="text-gray-800 font-semibold text-xl mb-1">Transaction Failed</p>
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

                  <p>Reason for failure : {payment && payment.engineStatus ? payment.engineStatus : "Technical failure!"}</p>

                  {redirection &&
                    <p>Please contact the merchant for further information.</p>
                  }

                  {!redirection &&
                    <div className="grid grid-cols-1" style={{ marginTop: '3%' }}>
                      <div className="mb-8 mt-2 flex items-center">
                        <p className="">
                          <span className="hover:cursor-pointer hover:border-b-[1.5px] border-blue-700 text-blue-700" onClick={navigateToPayment}>Redirect to payment page</span>
                          <span> or auto redirection in {countdown} seconds...</span>
                        </p>
                      </div>
                    </div>
                  }
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

export default connect(mapStateToProps)(PaymentFailed);
