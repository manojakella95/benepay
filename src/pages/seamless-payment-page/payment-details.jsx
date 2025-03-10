import React, { useEffect, useState } from "react";
import moment from "moment";
import paymentRequestLogo from "../../assets/payment-request.svg";
// import { connect } from "react-redux";
import { PaymentService } from "../../service/api/payment.service";
import { baseUiUrl, baseUrl, urls } from "../../config/urlConfig";
// import { toast } from "react-toastify";
import getSymbolFromCurrency from "currency-symbol-map";
import Action from "../../redux/action";
import AppHeader from "../../components/app-frame/app-header/app-header";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import SeamlesPaymentList from "./partial-payments/index";
import PaymentInitiate from "./layout/payment-initiate";
import benepayLogo from "./layout/asset/benepay-transperent.png";
import seamlessPaymentPage from "./seamless-payment-page";


//Layout
import Layout from "./layout";
import HorizontalLinearStepper from "./layout/stepper";
import SeamlessPaymentPage from "./seamless-payment-page";
import Validator from "../../service/core/validator";
import { toast } from "react-toastify";
import { TextField } from "@mui/material";
import Utils from "../../service/core/utils";

const SeamlesPaymentDetails = (props) => {

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
  const [paymentAmount, setPaymentAmount] = useState(transactionDetails?.remainingAmount || '');
  const [activeIndex, setActiveIndex] = useState(0);
  const [currencyList, setCurrencyList] = useState([]);
  const [formValid, setFromValid] = useState(false);
  const [disablePayNow, setDisablePayNow] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    var token = fetchTransactionId();
    console.log("token", token);
    if (token) {
      getPaymentDetails(token, props && props.paymentDetails ? props.paymentDetails : null);
    }

    let search = window.location.search;
    let params = new URLSearchParams(search);

    var process = params.get("process");

    if (process === "initiated") {
      setPaymentInitiated(true);
    }

    getSupportedCurrency();
  }, []);

  useEffect(() => {
    if (paymentInitiated && paymentId) {
      payByCardNonSeamless(true);

      console.log("Processing paymentId", paymentId);
    }
  }, [paymentInitiated, paymentId, disablePayNow]);

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
      moment(transactionDetails.paymentReceivedDateTime).format("DD-MMM-YYYY"),
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
    console.log("payment id ", paymentId);
    let paymentDetailsResponse = data ? data : await PaymentService.getPaymentDetailsById(token);
    console.log("paymentDetailsResponse", paymentDetailsResponse);

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
    if (transactionDetails.paymentStatus && transactionDetails.paymentStatus.toUpperCase() === "IN_PROCESS") {
      setTimeout(() => {
        navigate("/payment-in-process", {
          state: {
            payment: transactionDetails,
          },
        });
        setDisabled(false);
        setPaymentProcessing(false);
      }, 2000);
    }

    setLoading(false);
    if (!paymentDetailsResponse) {
      let url = baseUiUrl + "/invalid-payment";
      window.open(url, "_self");
      return;
    }
    if (paymentDetailsResponse && paymentDetailsResponse["Error Code"] && paymentDetailsResponse["Error Code"] === "404:NOT_FOUND") {
      setLoading(false);
      let url = baseUiUrl + "/invalid-payment";
      window.open(url, "_self");
      return;
    }

    if (
      paymentDetailsResponse.finalDueDate &&
      paymentDetailsResponse.finalDueDate !== null
    ) {
      const date = new Date(
        paymentDetailsResponse.finalDueDate.replace("IST", "")
      );
      paymentDetailsResponse.finalDueDate = moment(date).format("DD-MMM-YYYY");
    }
    paymentDetailsResponse.transactionId = paymentDetailsResponse.requestorTransactionId
    // console.log("paymentDetailsResponse ", paymentDetailsResponse)
    await setTransactionDetails(paymentDetailsResponse);
    await setPaymentAmount(paymentDetailsResponse.allowPartialPayments ? paymentDetailsResponse.remainingAmount : paymentDetailsResponse.finalDueAmount);
    sessionStorage.setItem("poweredByBp", transactionDetails.poweredByBp);

    // // should check partial amount
    // if(paymentDetailsResponse.allowPartialPayments){
    //   setPayBtnText("Pay Entire Amount");
    // }
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

    if (token) {

      console.log("initiated", paymentInitiated);
      if (paymentInitiated) {
        await checkOnlinePaymentStatus(token);
      }

      var details = await updateTransactionDetails(token);
      console.log("trans details", details);

      if (details) {
        var redirected = redirectBasedonStatus(details);

        // when no redirection then navigate partial payment screen
        if (!redirected) {
          navigate("/partial-payment", {
            state: {
              payment: transactionDetails,
            },
          });
        }
      }
    }
  }

  const payByCardNonSeamless = async (forProcessCall = false) => {

    if(forProcessCall && transactionDetails && transactionDetails.isSeamlessEnabled && !transactionDetails.allowPartialPayments){
      var redirected = redirectBasedonStatus(transactionDetails);
      if(!redirected){
        setPaymentAmount(transactionDetails.finalDueAmount);
        setActiveIndex(1);
      }
      return;
    }

    if(forProcessCall && transactionDetails && transactionDetails.allowPartialPayments){
      return;
    }

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

        // console.log("redirected", redirected);

        // when no redirection then navigate partial payment screen
        if (!redirected) {
          setPaymentState("initWithCard");
          setTimeout(() => {
            setDisabled(false);
            setPaymentProcessing(false);
            setPayBtnText("Pay Now");
          }, 4000);

          let requestJson = {};
          requestJson["paymentId"] = transactionDetails.requestorTransactionId;

          let encryptedJson = await Utils.encryptData(JSON.stringify(requestJson), await Utils.decryptData(transactionDetails.encKey));

          if (transactionDetails.allowPartialPayments) {
            if (paymentAmount) {
              var encryptedAmount = btoa(paymentAmount);
              window.location.href = `${baseUrl}${urls.payByCard}${paymentId}/${encryptedJson}?payload=${encryptedAmount}`;
            } else {
              toast.error("Payment amount is required!")
            }
          }
          else {
            window.location.href = `${baseUrl}${urls.payByCard}${paymentId}/${encryptedJson}`;
          }
        }
      }
    }
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
    if (transactionDetails.paymentStatus && transactionDetails.paymentStatus.toUpperCase() === "FAILED") {
      navigate("/payment-failed", {
        state: {
          payment: transactionDetails,
          redirection: true
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

    if (response.statusCode === 302) {
      window.location.href = response.location;
    }
  }

  const getSupportedCurrency = async () => {
    const response = await PaymentService.fetchCurrencyDecimals();

    if (response && response.data && response.data.currencyList.length > 0) {
      setCurrencyList(response.data.currencyList);
    }
  }

  const updateDecimal = (amount, currency) => {
    if (amount && currency) {
      let code = currencyList.filter((v) => v.code === currency);
      let decimal = code[0].decimal;

      if (code.length > 0) {
        var isValidDecimal = Validator.isValidDecimal(amount, decimal);

        if (isValidDecimal) {
          setPaymentAmount(amount);
        } else {
          let decimalUpdatedAmount = parseFloat(amount).toFixed(decimal)
          setPaymentAmount(decimalUpdatedAmount);
        }
      }
    }
  }

  const handlePartialAmount = (e) => {
    e.preventDefault();

    var remainingAmount = transactionDetails.remainingAmount ? transactionDetails.remainingAmount : '0.00';
    var value = e.target.value;
    var isValid = validatePayment(value, remainingAmount);
    if (value.length == 0) {
      setDisablePayNow(true);
    } else {
      setDisablePayNow(!isValid);
    }
    return isValid;
  }

  const validatePayment = (value, remainingAmount) => {

    if (value) {
      var { valid, error } = Validator.isNumber(value, remainingAmount);

      if (valid === true) {
        setPaymentAmount(value);
        // setErrorMessage('');
        setFromValid(true);
      } else {
        toast.error(error);
        setPaymentAmount('');
        setFromValid(false);
      }
    } else {
      setPaymentAmount('');
      toast.error("This is required");
      setFromValid(false);
    }

    if (parseFloat(value) <= parseFloat(0)) {
      toast.error('Amount not equal to zero');
      setFromValid(false);
      return false;
    }
    else if (parseFloat(value) > parseFloat(remainingAmount)) {
      toast.error('Amount should not more than outstanding amount');
      setFromValid(false);
      return false;
    }

    return true;
  }

  return (
    paymentInitiated  && transactionDetails != null && !transactionDetails.isSeamlessEnabled ? <PaymentInitiate/> :
     <> 
      <Layout
        headerLogo={transactionDetails.merchantLogoUrl}
        headerChildren={<HorizontalLinearStepper activeIndex={0} setActualActiveIndex={(index) => { setActiveIndex(index) }} />}
        bgColor="bg-white"
      >
        {activeIndex === 0 ? <>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-1 py-2 px-1 pt-3 md:py-2 md:px-2 font-roboto min-h-[87%] md:min-h-[95%]">
            <div className="bg-white item-center justify-center h-auto hidden md:flex">
              <img
                class="h-[30%] max-h-[175px] bg-transparent aspect-auto mr-2"
                src={transactionDetails.merchantLogoUrl}
                alt=""
                style={{ marginTop: '15%' }}
              />
            </div>

            <div className="col-span-2 h-full flex items-center justify-center lg:mr-5 ">
              <div class="h-full w-full max-w-4xl bg-white border border-gray-200 rounded-lg drop-shadow-xl relative px-2 py-3 md:p-0">
                <div className="mx-2 md:mx-10 mt-6 max-h-full">
                  <div class="grid grid-rows-2 grid-flow-col gap-1 min-w-full">
                    <div>
                      <span className="text-lg">Dear <span class="font-bold tracking-tight text-gray-900">{transactionDetails.debtorName},</span></span>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">You have received a payment request</p>
                    </div>
                  </div>
                </div>

                <div class="grid grid-rows-1 grid-flow-col mt-2">
                  <div>
                    <hr className="w-auto" />
                  </div>
                </div>

                {/* Payment Details */}
                <div className="mt-4 mx-2 md:mx-10 space-y-3 text-sm md:text-base">
                  <p className="text-lg font-bold tracking-tight text-blue-700 mb-5">Payment Request</p>

                  {/* Grid Layout for Payment Details */}
                  <div className="text-base grid grid-cols-2 md:grid-cols-2 gap-y-3 gap-x-6">
                    <p>Subtotal (Including charges)</p>
                    <p className="text-2xl -mt-2">
                      {getSymbolFromCurrency(
                        transactionDetails.collectionAmountCurrency
                      )}{" "}
                      {transactionDetails.finalDueAmount}
                    </p>

                    <p>Charges / Taxes</p>
                    <p className="">
                      {transactionDetails.charges ? `${getSymbolFromCurrency(
                        transactionDetails.collectionAmountCurrency
                      )} ${transactionDetails.charges}` : "-"}
                    </p>

                    <p>Due by</p>
                    <p className="">{transactionDetails.finalDueDate ? moment(transactionDetails.finalDueDate, "DD-MMM-YYYY").format("DD-MM-YYYY") : "-"}</p>

                    <p>Description</p>
                    <p className="">{transactionDetails.reasonForCollection ? transactionDetails.reasonForCollection : "-"}</p>

                    <p>Reference</p>
                    <p className="">{transactionDetails.collectionReferenceNumber ? transactionDetails.collectionReferenceNumber : "-"}</p>
                  </div>

                  {transactionDetails.allowPartialPayments &&
                    <div className="grid grid-cols-1 gap-y-3 gap-x-6">

                      <SeamlesPaymentList transactionId={transactionDetails.requestorTransactionId}
                        paymentCurrency={transactionDetails.paymentCurrency}
                        paymentAmount={transactionDetails.paymentAmount}
                        lastTxn={true} />

                    </div>
                  }
                  {/* Total Outstanding */}
                  {transactionDetails.allowPartialPayments &&
                    <div className="border-t border-gray-200 mt-4 pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-2 items-center gap-y-3 gap-x-6">
                        <p className="text-base font-semibold">Total Outstanding</p>
                        <p className="text-2xl -mt-2 font-bold text-blue-700">
                          {getSymbolFromCurrency(
                            transactionDetails.collectionAmountCurrency
                          )}{" "}
                          {transactionDetails.remainingAmount}
                        </p>
                      </div>
                    </div>}

                  <div className="grid grid-cols-1" style={{ marginTop: '3%' }}>
                    <div className="mb-8">
                      {/* Payment Input */}

                      {transactionDetails.allowPartialPayments &&
                        <>
                          <TextField
                            required
                            placeholder="Enter amount you want to pay"
                            label="Amount"
                            value={paymentAmount}
                            rows={1}
                            // onChange={(e) => setPaymentAmount(e.target.value)}
                            onChange={handlePartialAmount}
                            onBlur={(e) => updateDecimal(e.target.value, transactionDetails.collectionAmountCurrency)}
                            className="w-full border-b-2 border-gray-300 rounded-md px-3 mt-4 outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          {/* <input
                          type="text"
                          placeholder="Enter amount you want to pay"
                          // value={transactionDetails.remainingAmount}
                          value={paymentAmount}
                          // onChange={(e) => setPaymentAmount(e.target.value)}
                          onChange={handlePartialAmount}
                          onBlur={(e) => updateDecimal(e.target.value, transactionDetails.collectionAmountCurrency)}

                          className="w-full border-b-2 border-gray-300 rounded-md px-3 py-2 mt-2 outline-none focus:ring-2 focus:ring-blue-400"
                        /> */}
                        </>
                      }

                      {/* Pay Now Button */}
                      <button
                        disabled={disablePayNow}
                        // onClick={payByCard}
                        onClick={async () => {
                          var remainingAmount = transactionDetails.remainingAmount ? transactionDetails.remainingAmount : '0.00';
                          if(transactionDetails.allowPartialPayments){
                            if(!validatePayment(paymentAmount, remainingAmount)){
                              return;
                            }
                          }

                          if(!transactionDetails.isSeamlessEnabled){
                            await payByCardNonSeamless();
                            return;
                          }
                          setPaymentProcessing(true);
                          setPayBtnText("Please wait...");
                          
                          let token = fetchTransactionId();

                          if (token) {
                            var details = await updateTransactionDetails(token);
                      
                            if (details) {
                              var redirected = redirectBasedonStatus(details);

                              if(!redirected){
                                if (paymentAmount && paymentAmount.length > 0) {
                                  setActiveIndex(1);
                                }else{
                                  toast.error("Please provide payment amount!");
                                }
                              }
                            }
                          }

                          setPaymentProcessing(false);
                          setPayBtnText("Pay Now");
                        }
                        }
                        className={`w-full py-3 rounded-lg mt-3 mb-8 flex justify-center items-center transition-all duration-200 ease-in-out ${isPaymentProcessing || disablePayNow
                            ? 'bg-gray-400 cursor-not-allowed text-white'  // Apply grey background, disabled cursor, and white text
                            : 'bg-blue-600 hover:bg-blue-700 text-white'  // Apply blue background with white text and hover effect when enabled
                          }`}
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
                        <p>{payBtnText}</p>
                      </button>
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
        </> : <>
          <SeamlessPaymentPage paymentDtails={transactionDetails} paymentAmount={paymentAmount} />
        </>}
      </Layout>
    </>
  );
}

export default SeamlesPaymentDetails;