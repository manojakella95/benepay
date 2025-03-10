import React from "react";
import { connect } from "react-redux";
import { useLocation } from "react-router";
import Layout from "../seamless-payment-page/layout";
import HorizontalNonLinearStepper from "../seamless-payment-page/layout/stepper";
import benepayLogo from "../seamless-payment-page/layout/asset/benepay-transperent.png";
import paymentInfoIcon from "../../assets/payment-info.png";
import { Alert } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import getSymbolFromCurrency from "currency-symbol-map";
import moment from "moment";
import { commonRedirectUrl } from "../../config/urlConfig";

const RefundIssued = (props) => {
  const { state } = useLocation();
  const { payment } = state || {};

  const closeWindow = () => {
    window.open(commonRedirectUrl, '_self');
  }

  const handleCopyClick = async () => {

    const valuesToCopy = [
      getSymbolFromCurrency(payment.refundCcy),
      payment.refundAmount,
      moment(payment.refundDate).format("DD/MM/YYYY"),
      payment.refundDetail ? payment.refundDetail : 'NA',
      getSymbolFromCurrency(payment.refundCcy),
      payment.refundAmount,
      moment(payment.paymentDate).format("DD/MM/YYYY"),
      payment.refundDetail

    ];
    const labels = [
      "Refund Amount : ",
      "",
      "Refund Date : ",
      "Details : ",
      "Original Payment Amount : ",
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



  return (
    <>
      <Layout
        headerLogo={payment.customerLogo}
        headerChildren={<HorizontalNonLinearStepper skipOtherActiveindex={true} activeIndex={1} setActualActiveIndex={(index) => { }} lastStep={"Refund Issued"} />}
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
                  <Alert severity="info">Refund has been already issued for this payment</Alert>
                  <div className="h-fit flex flex-col justify-center items-center w-full mt-6 mx-auto">
                    <img
                      class="h-30 bg-transparent aspect-auto mx-auto mb-4"
                      src={paymentInfoIcon}
                      alt=""
                    />
                    <p className="text-gray-800 font-semibold text-xl mb-1">Refund Issued</p>
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
                    <p>Amount Refunded</p>
                    <p className="text-lg -mt-2">
                      {getSymbolFromCurrency(payment.refundCcy)}{" "}
                      {payment.refundAmount}
                    </p>

                    {/* <p>Benepay Transaction Id</p>
                                    <p className="">{payment && payment.requestorTransactionId ? payment.requestorTransactionId : ""}</p> */}

                    <p>Date of Refund</p>
                    <p className="">{payment && payment.refundDate ? moment(payment.refundDate).format("DD-MM-YYYY") : "NA"}</p>

                    <p>Refund reason</p>
                    <p className="">{payment.refundDetail ? payment.refundDetail : 'NA'}</p>
                  </div>
                  <div>
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

                  <div className="grid grid-cols-1" style={{ marginTop: '3%' }}>
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg mt-3 hover:bg-blue-700 transition-all duration-200 ease-in-out flex justify-center items-center" onClick={closeWindow}>Close window</button>
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

export default connect(mapStateToProps)(RefundIssued);
