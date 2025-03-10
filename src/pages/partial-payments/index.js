import React, { useEffect, useState } from "react";
import merchantLogo from "../../assets/robotic-school.png";
import "./partial-payment.css";
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
import { useNavigate, useLocation } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import PaymentList from "../partial-payments/list-payment";
import Validator from "../../service/core/validator";
import Utils from "../../service/core/utils";
import { DateTimeFormats } from "../../config/constants";

const PartialPayment = (props) => {
    const { device } = props;
    const navigate = useNavigate();
    const { state } = useLocation();
    const [transactionDetails, setTransactionDetails] = useState({});
    const [partialAmount, setPartialAmount] = useState();
    const [errorMessage, setErrorMessage] = useState("");
    const [paymentId, setPaymentId] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [isPaymentProcessing, setPaymentProcessing] = useState(false);
    const [payBtnText, setPayBtnText] = useState("Pay");
    const [paymentMode, setPaymentMode] = useState("card");
    const [isDisabled, setDisabled] = useState(true);
    const [currencyList, setCurrencyList] = useState([]);
    const [formValid, setFromValid] = useState(false);

    // const [showCopiedMsg, setShowCopiedMsg] = useState(false);

    useEffect(() => {
        setTransactionDetails(state.payment);
        console.log("ProcessPayment state", state.payment);
        getSupportedCurrency();
    }, []);

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
            transactionDetails.paymentReceivedDateTime,
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

    /**
     * @author Ragavan
     * Cancel button click event
     * Redirect to the payment request page
     */
    const navigateToPaymentRequest = async () => {
        navigate("/?token=" + transactionDetails.requestorTransactionId);
    }

    const payByCard = async () => {
        var { valid, error } = Validator.isNumber(partialAmount, transactionDetails.remainingAmount);

        if (!valid) {
            toast.error("Please enter a valid amount", { hideProgressBar: false });
            return;
        }
        setDisabled(true);
        if (paymentMode === "bank") {
            this.setState({ paymentState: "initWithBank" });
            return;
        }
        // console.log(transactionDetails);
        // console.log(
        //   "transactionDetails.paymentStatus ",
        //   transactionDetails.paymentStatus
        // );
        setPaymentProcessing(true);
        setPayBtnText("Please wait...");
        if (transactionDetails.paymentStatus && transactionDetails.paymentStatus.toUpperCase() === "PAID") {
            setTimeout(() => {
                navigate("/payment-already-paid", {
                    state: {
                        payment: transactionDetails,
                    },
                });
                setDisabled(false);
                setPaymentProcessing(false);
                setPayBtnText("Pay");
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
        if (transactionDetails.paymentStatus && transactionDetails.paymentStatus.toUpperCase() === "CANCELLED") {
            setTimeout(() => {
                navigate("/payment-cancelled", {
                    state: {
                        payment: transactionDetails,
                    },
                });
                setDisabled(false);
                setPaymentProcessing(false);
                setPayBtnText("Pay");
            }, 2000);
            return;
        }
        if (
            transactionDetails.paymentStatus &&
            transactionDetails.paymentStatus.toString().toUpperCase() === "EXPIRED"
        ) {
            setTimeout(() => {
                navigate("/payment-expired", {
                    state: {
                        payment: transactionDetails,
                    },
                });
                setDisabled(false);
                setPaymentProcessing(false);
                setPayBtnText("Pay");
            }, 2000);
            return;
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
            setTimeout(() => {
                navigate("/refund-issued", {
                    state: {
                        payment: transactionDetails,
                    },
                });
                setDisabled(false);
                setPaymentProcessing(false);
                setPayBtnText("Pay");
            }, 2000);
            return;
        }
        // setPaymentState("initWithCard");
        setTimeout(() => {
            setDisabled(false);
            setPaymentProcessing(false);
            setPayBtnText("Pay");
        }, 4000);

        let requestJson = {};
        requestJson["paymentId"] = transactionDetails.requestorTransactionId;

        let encryptedJson = await Utils.encryptData(JSON.stringify(requestJson), await Utils.decryptData(transactionDetails.encKey));

        var encryptedAmount = btoa(partialAmount);
        window.location.href = `${baseUrl}${urls.payByCard}${encryptedJson}?payload=${encryptedAmount}`;
    };

    const onPaymentModeChanged = (e) => {
        const { value } = e.target;
        setPaymentMode(value);
        this.setPaymentState("default");
    };

    const handlePartialAmount = (e) => {
        e.preventDefault();

        var remainingAmount = transactionDetails.remainingAmount ? transactionDetails.remainingAmount : '0.00';
        var value = e.target.value;

        validatePayment(value, remainingAmount);
    }

    const validatePayment = (value, remainingAmount) => {

        if (value) {
            var { valid, error } = Validator.isNumber(value, remainingAmount);

            if (valid === true) {
                setPartialAmount(value);
                setErrorMessage('');
                setFromValid(true);
            } else {
                setErrorMessage(error);
                setPartialAmount('');
                setFromValid(false);
            }
        } else {
            setPartialAmount('');
            setErrorMessage("This is required");
            setFromValid(false);
        }

        if (parseFloat(value) <= parseFloat(0)) {
            setErrorMessage('Amount not equal to zero');
            setFromValid(false);
        }
        else if (parseFloat(value) > parseFloat(remainingAmount)) {
            setErrorMessage('Amount not greaterthan to outstanding amount');
            setFromValid(false);
        }
    }

    const getSupportedCurrency = async () => {
        const response = await PaymentService.fetchCurrencyDecimals();

        if (response && response.data && response.data.currencyList.length > 0) {
            setCurrencyList(response.data.currencyList);
        }
    }

    //Update the partial payment decimal value base on the currency
    const updateDecimal = (amount, currency) => {
        if (amount && currency) {
            let code = currencyList.filter((v) => v.code === currency);
            let decimal = code[0].decimal;

            if (code.length > 0) {
                var isValidDecimal = Validator.isValidDecimal(amount, decimal);

                if (isValidDecimal) {
                    setPartialAmount(amount);
                } else {
                    let decimalUpdatedAmount = parseFloat(amount).toFixed(decimal)
                    setPartialAmount(decimalUpdatedAmount);
                }
            }
        }
    }

    return (
        <div className="">
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
                            <div className={`desktop ${device.scale === 0 ? "mobile-payment-details-main" : "payment-details-main"} mt-10 flex flex-col`}>
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

                                <div className="flex mt-9">
                                    <div className="" style={{ width: "98%" }}>
                                        <div className="dark:text-white p-6 py-3 my-py-3 bg-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                                            <div>
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 mb-4 mt-2 font-bold tracking-tight text-gray-900 dark:text-white" style={{ position: "relative" }}>
                                                    <p className="md:text-3xl text-3xl"
                                                        style={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}
                                                    >
                                                        Enter the amount you want to pay
                                                    </p>

                                                    <div className="md:text-3xl text-3xl flex sm:lg:justify-start md:justify-start lg:justify-end xl:justify-end"
                                                        style={{ alignItems: 'center' }}
                                                    >
                                                        <div style={{ fontSize: '41px', paddingRight: '5%' }}>
                                                            {getSymbolFromCurrency(transactionDetails.collectionAmountCurrency)}
                                                            {/* {transactionDetails.collectionAmountCurrency ? transactionDetails.collectionAmountCurrency : ''} */}
                                                        </div>
                                                        {/* {transactionDetails?.finalDueAmount} */}

                                                        <input
                                                            type="text"
                                                            id="partial_amount"
                                                            class="bg-gray-50 border border-gray-300 text-gray-900 text-2xl rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-50  my-w-50 p-1 pl-3 dark:bg-gray-800 dark:border-gray-300 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                            onChange={handlePartialAmount}
                                                            value={partialAmount}
                                                            onBlur={(e) => updateDecimal(e.target.value, transactionDetails.collectionAmountCurrency)}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="col-span-2 flex sm:lg:justify-start md:justify-start lg:justify-end xl:justify-end"
                                                    style={{ color: 'red' }}
                                                >
                                                    {errorMessage}
                                                </span>
                                            </div>

                                            <div
                                                className="divider bg-purple-900 w-full"
                                                style={{ height: "1.5px" }}></div>

                                            <div class="grid grid-cols-3 gap-4 my-gap-4">
                                                <div className="transaction-details my-3 col-span-2">
                                                    <table>
                                                        <tbody>
                                                            <tr className="h-9 my-h-8">
                                                                <td className="w-50">Outstanding Amount</td>
                                                                <td>
                                                                    <b>
                                                                        {transactionDetails.collectionAmountCurrency ? transactionDetails.collectionAmountCurrency : ''}{" "}
                                                                        {transactionDetails.remainingAmount ? transactionDetails.remainingAmount : '0.00'}
                                                                    </b>
                                                                </td>
                                                            </tr>
                                                            <tr className="h-9 my-h-8">
                                                                <td className="w-50">Original Requested Amount</td>
                                                                <td>
                                                                    <b>
                                                                        {transactionDetails.collectionAmountCurrency ? transactionDetails.collectionAmountCurrency : ''}{" "}
                                                                        {transactionDetails.finalDueAmount ? transactionDetails.finalDueAmount : '0.00'}
                                                                    </b>
                                                                </td>
                                                            </tr>
                                                                    <tr className="h-9 my-h-8">
                                                                        <td className="w-50">Date Requested</td>
                                                                        <td>
                                                                            <b>
                                                                                {moment(transactionDetails.paymentReceivedDateTime, "YYYY-MM-DDTHH:mm:ss.SSS").format(DateTimeFormats.defaultDateFormat)}                                                                            </b>
                                                                        </td>
                                                                    </tr>
                                                            <tr className="h-9 my-h-8">
                                                                <td className="w-50">Due by</td>
                                                                <td>
                                                                    <b>
                                                                        {transactionDetails.finalDueDate}
                                                                    </b>
                                                                </td>
                                                            </tr>
                                                            <tr className="h-9 my-h-8">
                                                                <td className="w-50">Towards</td>
                                                                <td>
                                                                    <b>
                                                                        {transactionDetails.reasonForCollection}
                                                                    </b>
                                                                </td>
                                                            </tr>
                                                            <tr className="h-9 my-h-8">
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

                                                <div>
                                                    <PaymentList transactionId={transactionDetails.transactionId} lastTxn={true} />
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                                <div className="trasaction-actions flex mt-6">
                                    <div>
                                        <button
                                            className={(!formValid ? "bg-gray-500 " : "bg-purple-800 hover:bg-purple-700") + " text-white py-2 rounded-full md:px-20 px-8 flex items-center"}
                                            style={{
                                                cursor: !formValid ? "not-allowed" : "pointer",
                                            }}
                                            onClick={payByCard}
                                            disabled={!formValid}
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
                                    </div>
                                    <div className="pl-2">
                                        <button
                                            className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-20 px-8 flex items-center"
                                            onClick={() => navigateToPaymentRequest()}
                                        >
                                            Cancel
                                        </button>
                                    </div>
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

export default connect(mapStateToProps)(PartialPayment);
