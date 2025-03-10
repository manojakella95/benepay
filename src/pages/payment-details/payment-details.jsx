import React, { useEffect, useState } from "react";
import merchantLogo from "../../assets/robotic-school.png";
import "./payment-details.css";
import mrcVisaLogo from "../../assets/visa-mastercard-logo.png";
import cardsLogo from "../../assets/cards.png";
import paymentRequestLogo from "../../assets/payment-request.svg";
import InfoIcon from "../../assets/info.png";
import { connect } from "react-redux";
import { PaymentService } from "../../service/api/payment.service";
import { baseUiUrl, baseUrl, urls } from "../../config/urlConfig";
import { toast } from "react-toastify";
import moment from "moment";
import getSymbolFromCurrency from "currency-symbol-map";
import Action from "../../redux/action";
import AppHeader from "../../components/app-frame/app-header/app-header";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import PaymentList from "../partial-payments/list-payment";
import PaymentInitiate from "./payment-initiate";
import Utils from "../../service/core/utils";

const PaymentDetails = (props) => {
  const { device } = props;
  const navigate = useNavigate();
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({});
  const [paymentId, setPaymentId] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isPaymentProcessing, setPaymentProcessing] = useState(false);
  const [payBtnText, setPayBtnText] = useState("Pay Now");

  const [isPartial, setPartial] = useState(false);
  const [partialBtnText, setPartialBtnText] = useState("Pay Partial Amount");

  const [paymentMode, setPaymentMode] = useState("card");
  const [isDisabled, setDisabled] = useState(false);
  const [paymentState, setPaymentState] = useState("default");
  const [isServiceCalled, setServiceCalled] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState("No Payment Available");
  // const [showCopiedMsg, setShowCopiedMsg] = useState(false);

  useEffect(() => {
    var token = fetchTransactionId();
    console.log("token",token);

    if(props && props.paymentDetails){
      setTransactionDetails(props.paymentDetails);
    }
    
    if( token ) {
      getPaymentDetails(token, props ? props.paymentDetails : null);
    }

    let search = window.location.search;
    let params = new URLSearchParams(search);

    var process = params.get("process");
    
    if( process === "initiated" ){
      setPaymentInitiated(true);
    }

  }, []);

  useEffect(() => {
    if( paymentInitiated && paymentId ){
      payByCard();
      
      console.log("Processing paymentId",paymentId);
    }
  }, [paymentInitiated, paymentId]);

  const fetchTransactionId = () => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let token = params.get("token");

    if (!token) {
      const pathParams = window.location.pathname.split('/');
      token = pathParams[1];
    }

    console.log("token ", token);

    return token;
  }

  const updateTransactionDetails = async (token) => {
    let paymentDetailsResponse = await PaymentService.getPaymentDetailsById(token);

    paymentDetailsResponse.transactionId = paymentDetailsResponse.requestorTransactionId;
    
    return paymentDetailsResponse;
  }

  const handleCopyClick = async () => {
    // setShowCopiedMsg(true)
    // if (!showCopiedMsg) {
    //   setTimeout(() => {
    //     setShowCopiedMsg( false )
    //   }, 500);
    // }

    const valuesToCopy = [
      getSymbolFromCurrency(transactionDetails.collectionAmountCurrency),
      transactionDetails?.finalDueAmount,
      moment(transactionDetails.paymentReceivedDateTime).format("DD-MM-YYYY"),
      transactionDetails.finalDueDate,
      transactionDetails.reasonForCollection,
      transactionDetails.collectionReferenceNumber
    ];
    const labels = [
      "Final Due Amount : ",
      "",
      "Payment Received DateTime : ",
      "Final Due Date : ",
      "Reason For Collection : ",
      "Collection Reference Number : "
    ];
    const copyString = valuesToCopy
      .map((value, index) => labels[index] + value + " ")
      .filter((value) => value.trim() !== "")
      .join("");
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


  const getPaymentDetails = async (token, data = null) => {
    setPaymentId(token);
    setLoading(true);
    console.log("payment id ", paymentId, data);
    let paymentDetailsResponse = data ? data : await PaymentService.getPaymentDetailsById(token);
    // console.log("paymentDetailsResponse", paymentDetailsResponse);
    
    // redirecting if already paid
    if (paymentDetailsResponse.paymentStatus && paymentDetailsResponse.paymentStatus.toUpperCase() === "PAID") {
      setTimeout(() => {
        navigate("/payment-already-paid", {
          state: {
            payment: paymentDetailsResponse,
          },
        });
      }, 2000);
      return;
    }
    if (paymentDetailsResponse.paymentStatus && paymentDetailsResponse.paymentStatus.toUpperCase() === "IN_PROCESS") {
      setTimeout(() => {
          navigate("/payment-in-process", {
              state: {
                  payment: paymentDetailsResponse,
              },
          });
          setDisabled(false);
          setPaymentProcessing(false);
      }, 2000);
  }

    setLoading(false);
    if (!paymentDetailsResponse) {
      let url = baseUiUrl + "/invalid-payment";
      window.open(url,"_self");
      return;
    }
    if(paymentDetailsResponse && paymentDetailsResponse["Error Code"] && paymentDetailsResponse["Error Code"] === "404:NOT_FOUND"){
      setLoading(false);
      let url = baseUiUrl + "/invalid-payment";
      window.open(url,"_self");
      return;
    }

    if (
      paymentDetailsResponse.finalDueDate &&
      paymentDetailsResponse.finalDueDate !== null
    ) {
      const date = new Date(
        paymentDetailsResponse.finalDueDate.replace("IST", "")
      );
      paymentDetailsResponse.finalDueDate = moment(date).format("DD-MM-YYYY");
    }
    paymentDetailsResponse.transactionId = paymentDetailsResponse.requestorTransactionId
    // console.log("paymentDetailsResponse ", paymentDetailsResponse)
    await setTransactionDetails(paymentDetailsResponse);
    sessionStorage.setItem("poweredByBp", transactionDetails.poweredByBp);

    // should check partial amount
    if(paymentDetailsResponse.allowPartialPayments){
      setPayBtnText("Pay Entire Amount");
    }
  };

  /**
   * @author Ragavan
   * Pay Part Amount click event
   * Redirect to the part payment page
   */
  const payPartAmount = async () => {    
    setPaymentProcessing(true);
    setPartial(true);
    setPartialBtnText("Please wait...");

    var token = fetchTransactionId();
    
    if( token ) { 
      
      console.log("initiated",paymentInitiated);
      if( paymentInitiated ){
        await checkOnlinePaymentStatus(token);
      }

      var details = await updateTransactionDetails(token);
      console.log("trans details", details);
      
      if(details){
        var redirected = redirectBasedonStatus(details);

        // when no redirection then navigate partial payment screen
        if( !redirected ){
          navigate("/partial-payment", {
            state: {
              payment: transactionDetails,
            },
          });
        }
      }
    }
  }

  const payByCard = async () => {

    setDisabled(true);

    if (paymentMode === "bank") {
      this.setState({ paymentState: "initWithBank" });
      return;
    }

    setPaymentProcessing(true);
    setPayBtnText("Please wait...");

    var token = fetchTransactionId();

    if (token) {
      var details = await updateTransactionDetails(token);

      if (details) {
        var redirected = redirectBasedonStatus(details);

        console.log("redirected", redirected);

        // when no redirection then navigate partial payment screen
        if (!redirected) {
          setPaymentState("initWithCard");
          setTimeout(() => {
            setDisabled(false);
            setPaymentProcessing(false);
            setPayBtnText("Pay Now");
          }, 4000);

          let requestJson = {};

          if (transactionDetails.partiallyPaid) {
            requestJson["paymentId"] = transactionDetails.requestorTransactionId;
          }
          else {
            requestJson["paymentId"] = paymentId;
          }

          let encryptedJson = Utils.encryptData(JSON.stringify(requestJson), await Utils.decryptData(transactionDetails.encKey));

          if (encryptedJson) callPayByCard(paymentId, encryptedJson, transactionDetails.partiallyPaid && btoa(transactionDetails.remainingAmount));

        }
      }
    }

    // console.log(transactionDetails);
    // console.log(
    //   "transactionDetails.paymentStatus ",
    //   transactionDetails.paymentStatus
    // );
  };

  const callPayByCard = async (paymentId, data, amount) => {
    let url = `${baseUrl}${urls.payByCard}${paymentId}/${data}`;
    if (amount) {
      url += `?payload=${amount}`;
    }
    window.location.href = url;
  };

  const redirectBasedonStatus = (transactionDetails) => {
    if (transactionDetails.paymentStatus && transactionDetails.paymentStatus.toUpperCase() === "PAID") {
      navigate("/payment-already-paid", {
        state: {
          payment: transactionDetails,
        },
      });

      return true;
    }
    if (transactionDetails.paymentStatus && transactionDetails.paymentStatus.toUpperCase() === "IN_PROCESS") {
      navigate("/payment-in-process", {
        state: {
          payment: transactionDetails,
        },
      });
      return true;
    }
    if (transactionDetails.paymentStatus && transactionDetails.paymentStatus.toUpperCase() === "CANCELLED") {
      navigate("/payment-cancelled", {
        state: {
          payment: transactionDetails,
        },
      });

      return true;
    }
    if (
      transactionDetails.paymentStatus &&
      transactionDetails.paymentStatus.toString().toUpperCase() === "EXPIRED"
    ) {
      navigate("/payment-expired", {
        state: {
          payment: transactionDetails,
        },
      });

      return true;
    }

    if (
      (transactionDetails.paymentStatus &&
        transactionDetails.paymentStatus.toString().toUpperCase() ===
        "PARTIALLY_REFUNDED") ||
      transactionDetails.paymentStatus.toString().toUpperCase() ===
      "FULLY_REFUNDED" ||
      transactionDetails.paymentStatus.toString().toUpperCase() ===
      "REFUNDED"
    ) {
      navigate("/refund-issued", {
        state: {
          payment: transactionDetails,
        },
      });

      return true;
    }

    return false;
  }

  const onPaymentModeChanged = (e) => {
    const { value } = e.target;
    setPaymentMode(value);
    this.setPaymentState("default");
  };

  const checkOnlinePaymentStatus = async (token) => {
    let response = await PaymentService.getOnlinePaymentStatus(token);

    if(response.statusCode === 302 ){
      window.location.href = response.location;
    }
  }
  
  return (
    paymentInitiated ? <PaymentInitiate/> : <div className="">
      <AppHeader username={transactionDetails.debtorName} />
      {isLoading ? (
        <div id="semiTransparenDiv"></div>
      ) : (
        <>
          {transactionDetails &&
            Object.keys(transactionDetails).length === 0 &&
            (device.scale === 1 || device.scale === 2 || device.scale === 3) ? (
            <div style={{ width: "60%", margin: "0 auto", marginTop: "5rem" }}>
              <div className="flex justify-center mt-12 w-full">
                <div className="p-6 bg-white rounded-lg shadow-md dark:text-white dark:bg-gray-800 dark:border-gray-700 w-full text-center h-80 flex items-center justify-center">
                  No Payment Available
                </div>
              </div>
            </div>
          ) : (
            <>
              {device.scale === 1 ||
                device.scale === 2 ||
                device.scale === 3 ? (
                <div className="desktop payment-details-main mt-10 flex flex-col">
                  <div className="payment-details-header flex w-full">
                    <div className="merchant-logo flex items-center flex-1 pt-4">
                      <img
                        src={transactionDetails.merchantLogoUrl}
                        alt=""
                        style={{ maxWidth: "100px" }}
                      />
                      <strong className="md:text-3xl text-2xl text-purple-800 font-bold ml-3">
                        Payment Request
                      </strong>
                    </div>
                    {transactionDetails.poweredByBp && (
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
                  <div className="flex pb-5 pt-1">
                    <div className="merchant-details flex flex-col text-lg">
                      <p className="my-4">
                        Dear <b>{transactionDetails.debtorName}</b> {" "} {transactionDetails.debtorEmailId ? `(${transactionDetails.debtorEmailId})` : (transactionDetails.debtorMobileNumber ? `(${transactionDetails.debtorMobileNumber})` : ``)}{" "}
                      </p>
                      <p>
                        <b>{transactionDetails.merchantName}</b> is requesting a
                        payment
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="" style={{ width: "98%" }}>
                      <div className="dark:text-white p-6 py-3 bg-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                        <div>
                          <h5 className="mb-2 md:text-5xl text-3xl font-bold tracking-tight text-gray-900 dark:text-white" style={{ position: "relative" }}>
                            {getSymbolFromCurrency(
                              transactionDetails.collectionAmountCurrency
                            )}{" "}
                            {transactionDetails.partiallyPaid ? transactionDetails.remainingAmount : transactionDetails.finalDueAmount}
                            {/* {transactionDetails?.finalDueAmount} */}
                            <span title="copy" > <FontAwesomeIcon icon={faCopy} onClick={handleCopyClick} style={{ cursor: "pointer", position: "absolute", right: "0%", height: "40px", width: "30px" }} /> </span>

                          </h5>
                        </div>

                        <div
                          className="divider bg-purple-900 w-full"
                          style={{ height: "1.5px" }}></div>
                      
                        <div class="grid grid-cols-3 gap-4">
                          <div className="transaction-details my-3 col-span-2">
                            <table>
                              <tbody>
                              {transactionDetails.partiallyPaid && (
                                    <tr className="h-9">
                                        <td className="w-50">Original Requested Amount</td>
                                        <td>
                                            <b>
                                              {transactionDetails.collectionAmountCurrency ? transactionDetails.collectionAmountCurrency : ''}{" "}
                                              {transactionDetails.finalDueAmount ? transactionDetails.finalDueAmount : '0.00'}
                                            </b>
                                        </td>
                                    </tr>
                                )}
                                <tr className="h-9">
                                  <td className="w-50">Date Requested</td>
                                  <td>
                                    <b>
                                      {moment(
                                        transactionDetails.paymentReceivedDateTime,"YYYY-MM-DDTHH:mm:ss.SSS"
                                      ).format("DD-MM-YYYY")}
                                    </b>
                                  </td>
                                </tr>
                                <tr className="h-9">
                                  <td className="w-50">Due Date</td>
                                  <td>
                                    <b>{transactionDetails.finalDueDate}</b>
                                  </td>
                                </tr>
                                <tr className="h-9">
                                  <td className="w-50">Towards</td>
                                  <td>
                                    <b>
                                      {transactionDetails.reasonForCollection}
                                    </b>
                                  </td>
                                </tr>
                                <tr className="h-9">
                                  <td className="w-50">Reference</td>
                                  <td>
                                    <b>
                                      {transactionDetails.collectionReferenceNumber}
                                    </b>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {transactionDetails.allowPartialPayments && <div>
                            <PaymentList  transactionId={transactionDetails.requestorTransactionId} lastTxn={true}/>
                          </div>}

                        </div>
                        
                      </div>
                    </div>
                  </div>
                  <div className="trasaction-actions flex mt-6">
                    {!isPartial && <div>
                      <button
                        className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-20 px-8 flex items-center"
                        style={{
                          cursor: isDisabled ? "not-allowed" : "pointer",
                        }}
                        onClick={payByCard }
                        disable={isDisabled}
                      >
                        {isPaymentProcessing && (
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
                        {payBtnText}
                      </button>
                    </div>}

                    {transactionDetails.allowPartialPayments && paymentState !== "initWithCard" ? 
                      <div className="pl-2">
                        <button
                          className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-20 px-8 flex items-center"
                          style={{
                            cursor: isDisabled ? "not-allowed" : "pointer",
                          }}
                          onClick={payPartAmount}
                          disable={isDisabled}
                        >
                          {(isPaymentProcessing && transactionDetails.allowPartialPayments && isPartial) &&(
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
                          {partialBtnText}
                        </button>
                      </div>
                    :''}
                    {/* <div className="pay-with-bank-account px-4">
                      <button
                        className="bg-purple-400 cursor-not-allowed text-white font-bold py-2 rounded-full md:px-14 px-5"
                        disabled
                      >
                        Pay via Bank Account
                      </button>
                    </div> */}
                  </div>
                  <div className="payment-types-logo my-2">
                    <img src={cardsLogo} width={"30%"} />
                  </div>
                </div>
              ) : (
                <div className="payment-details-mobile px-10 h-screen">
                  {transactionDetails.poweredByBp && (
                    <div className="flex justify-end">
                      <div className="pb-benepay">
                        <span className="text-sm">Powered by</span>
                        <p className="text-xl">
                          <b>BenePay</b>
                        </p>
                      </div>
                    </div>
                  )}
                  {Object.keys(transactionDetails).length != 0 ? (
                    <div className="payment dark:text-white">
                      <div className="payment-details-payer-header mt-4">
                        <div className="p-6 bg-white rounded-lg border dark:bg-gray-800 dark:border-gray-700 border-gray-500">
                          <div className="payment-requester-details">
                            <div className="flex">
                              <div className="payment-request-logo">
                                <img
                                  src={paymentRequestLogo}
                                  alt=""
                                  className="w-12"
                                />
                              </div>
                              <div className="requester-name pl-5">
                                <h5 className="text-xl">
                                  <b>Payment Request</b>
                                </h5>
                                <p className="text-sm">
                                  <b>{transactionDetails.merchantName}</b>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row mt-5">
                        <p className="text-gray-900">
                          Dear <b>{transactionDetails.debtorName}</b> {" "} {transactionDetails.debtorEmailId ? `(${transactionDetails.debtorEmailId})` : (transactionDetails.debtorMobileNumber ? `(${transactionDetails.debtorMobileNumber})` : ``)}{" "}
                        </p>
                      </div>

                      <div className="transaction-payer-details-mobile">
                        <span title="copy" > <FontAwesomeIcon icon={faCopy} onClick={handleCopyClick} style={{ cursor: "pointer", position: "absolute", right: "13%", height: "40px", width: "30px", marginTop:"3%" }} /> </span>
                        <div className="p-1 bg-white rounded-lg border border-gray-500 dark:bg-gray-800 dark:border-gray-700 flex items-center flex-col vh-55 justify-center">
                          <span style={{ position: "relative" }}>
                            <img
                              src={transactionDetails.merchantLogoUrl}
                              alt=""
                              className="merchant-logo-mobile"
                            />
                          </span>
                          <p className="text-center mt-4">
                            <b className="text-xl" >
                              {transactionDetails.merchantName}
                            </b>

                          </p>
                          <h5 className="text-4xl font-bold mt-4">
                            {getSymbolFromCurrency(
                              transactionDetails.collectionAmountCurrency
                            )}{" "}
                            {/* {transactionDetails?.remainingAmount} */}
                            {transactionDetails.partiallyPaid ? transactionDetails.remainingAmount : transactionDetails.finalDueAmount}
                          </h5>

                          <div class="grid grid-cols-3 mt-8 gap-1">
                            <div className="mb-4">Date Requested</div>
                            <div className="flex justify-center">-</div>
                            <div>{moment(transactionDetails.paymentReceivedDateTime,"YYYY-MM-DDTHH:mm:ss.SSS").format("DD-MM-YYYY")}</div>
                            <div className="mb-4">Due Date</div>
                            <div className="flex justify-center">-</div>
                            <div className="relative group">
                              <p className="truncate">{transactionDetails.finalDueDate}</p>
                              
                              <div class="absolute transform -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {transactionDetails.finalDueDate}
                              </div>
                            </div>

                            <div className="mb-4">Towards</div>
                            <div className="flex justify-center">-</div>
                            <div className="relative group">
                              <p className="truncate">{transactionDetails.reasonForCollection}</p>
                              
                              <div class="absolute transform -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {transactionDetails.reasonForCollection}
                              </div>
                            </div>

                            <div className="mb-4">Reference</div>
                            <div className="flex justify-center">-</div>
                            <div className="relative group">
                              <p className="truncate">{transactionDetails.collectionReferenceNumber}</p>
                              
                              <div class="absolute transform -translate-x-1/2 bottom-full mb-2 w-max px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {transactionDetails.collectionReferenceNumber}
                              </div>
                            </div>
                          </div>
                        </div>

                        {transactionDetails.allowPartialPayments && <div className="mt-2">
                            <PaymentList  transactionId={transactionDetails.requestorTransactionId} lastTxn={true}/>
                          </div>}
                      </div>
                      <div className="pay-now mt-6">
                        <button
                          className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full w-full flex justify-center"
                          disabled={isDisabled}
                          onClick={payByCard}
                          style={{
                            cursor: isDisabled ? "not-allowed" : "pointer",
                          }}
                        >
                          {isPaymentProcessing && !isPartial && (
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
                         Pay Entire Amount
                        </button>
                      </div>
                      {transactionDetails.allowPartialPayments && paymentState !== "initWithCard" ? 
                      <div className="pay-now mt-6">
                      <button
                          className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full w-full flex justify-center"
                          disabled={isDisabled}
                          onClick={payPartAmount}
                          style={{
                            cursor: isDisabled ? "not-allowed" : "pointer",
                          }}
                        >
                          {(isPaymentProcessing && transactionDetails.allowPartialPayments && isPartial) &&(
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
                         Pay Partial Amount
                        </button>
                        </div> : "" }
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        margin: "0 auto",
                        marginTop: "5rem",
                      }}
                    >
                      <div className="flex justify-center mt-12 w-full">
                        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-white dark:border-gray-700 w-full text-center h-80 flex items-center justify-center">
                          No Payment Available
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
const mapStateToProps = (state) => {
  return {
    device: state.device,
  };
};

export default connect(mapStateToProps)(PaymentDetails);
