import React, { useState, useEffect, useRef } from "react";
import { connect } from "react-redux";
import "./seamless-payment-page.css";
import { PaymentService } from "../../service/api/payment.service";
import { baseUiUrl, baseUrl, urls } from "../../config/urlConfig";
import { useNavigate } from "react-router";
import moment from "moment";
import getSymbolFromCurrency from "currency-symbol-map";
import visa from "../../assets/images/payment-method-logos/visa-logo.png";
import mastercard from "../../assets/images/payment-method-logos/mastercard-logo.png";
import maestro from "../../assets/images/payment-method-logos/maestro-logo.png";
import rupay from "../../assets/images/payment-method-logos/Rupay-Logo.png";
import gpay from "../../assets/images/payment-method-logos/gpay-logo.png";
import phonepe from "../../assets/images/payment-method-logos/phone-pe-logo.png";
import paytm from "../../assets/images/payment-method-logos/paytm-logo.png";
import amzonpay from "../../assets/images/payment-method-logos/amazon-pay-logo.png";
import bhmi from "../../assets/images/payment-method-logos/bhmi-axis-logo.png";
import allUpi from "../../assets/images/payment-method-logos/allUpi-logo.png";
import gpay2 from "../../assets/images/payment-method-logos/gpay-logo-2.png";
import netbankingLogo from "../../assets/images/payment-method-logos/nb.png";
import amex from "../../assets/images/payment-method-logos/amex.png";
import diners from "../../assets/images/payment-method-logos/diners.png";
import discover from "../../assets/images/payment-method-logos/discover.png";
import { messages } from "../../config/constants";
import Utils from "../../service/core/utils";
import { toast } from "react-toastify";
import benepayLogo from "./layout/asset/benepay-transperent.png";
import { Autocomplete, Grid, TextField, Typography } from "@mui/material";
import LocationService from "../../service/api/location.service";
// import "react-datepicker/dist/react-datepicker.css";
import { flushSync } from "react-dom";
import UpiIntentProcessing from "./components/upi-intent-processing";
import UpiInfoModal from "./components/upi-info-modal";
import AlertDialog from "../../components/alerDialog";


const SeamlessPaymentPage = (props) => {
    // State to manage which payment method is active
    const [activeMethod, setActiveMethod] = useState(null);
    const { device } = props;
    const navigate = useNavigate();
    const [paymentInitiated, setPaymentInitiated] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState({});
    const [paymentId, setPaymentId] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [isPaymentProcessing, setPaymentProcessing] = useState(false);
    const [payBtnText, setPayBtnText] = useState("Pay Now");

    const [isPartial, setPartial] = useState(false);
    const [isDisabled, setDisabled] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(true);
    const [paymentMethodSelected, setPaymentMethodSelected] = useState(false);
    const [transactionAmount, setTransactionAmount] = useState('');
    const [merchantId, setMerchantId] = useState("");
    const [providerId, setProviderId] = useState("");
    const [filteredPaymentMethods, setFilteredPaymentMethods] = useState([])
    const [isConfirmBtn, setIsConfirmBtn] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(props.paymentAmount);
    const [payerVpaName, setPayerVpaName] = useState("");
    const [traceId, setTraceId] = useState("");
    const [netbankingUpList, setNetBankingUpList] = useState([]);
    const [isConfirmBtnClicked, setIsConfirmBtnClicked] = useState(false);
    const [cardScheme, setCardScheme] = useState("");
    const [screenLoading, setScreenLoading] = useState(false);
    const [isConfirmBtnVisible, setIsConfirmBtnVisible] = useState(false);

    const [upiIntentClicked, setUpiIntentClicked] = useState(false);
    const [statusUrl, setStatusurl] = useState("");
    const [intentOpened, setIntentOpened] = useState(false);

    const isConfirmBtnClickedRef = useRef(false);

    const [fetchPaymentDetailsResponse, setFetchPaymentDetailsResponse] = useState(null);
    const [isCardChecked, setIsCardChecked] = useState(false);
    const [isUpiInfoBtnClicked, setIsUpiInfoBtnClicked] = useState(false);
    const [upiModelType, setUpiModelType] = useState("1");
    const [isCardValid, setIsCardValid] = useState(false);
    const [isCardValidByHealthCheck, setIsCardValidByHealthCheck] = useState({ isValid: false, bin: null });
    const [openCancellPaymentAlertBox, setOpenCancellPaymentAlertBox] = useState(false);


    useEffect(() => {
        isConfirmBtnClickedRef.current = isConfirmBtnClicked; // Always keep ref updated
    }, [isConfirmBtnClicked]);

    const brandLogoMap = {
        visa: visa,
        mastercard: mastercard,
        maestro: maestro,
        rupay: rupay,
        gpay: gpay,
        phonepe: phonepe,
        paytm: paytm,
        gpay2: gpay2,
        amzonpay: amzonpay,
        bhmi: bhmi,
        allUpi: allUpi,
        amex: amex,
        diners: diners,
        discover: discover
    };

    const [formState, setFormState] = useState({
        debitCard: {
            number: "",
            nameOnCard: "",
            expiryDate: null,
            expiryInput: "",
            cvv: null,
        },
        creditCard: {
            number: "",
            nameOnCard: "",
            expiryDate: null,
            expiryInput: "",
            cvv: null,
        },
        upi: {
            vpa: "",
        },
        netbanking: {
            bankCode: null,
        }
    });

    const [formErrors, setFormErrors] = useState({
        debitCard: {
            numberError: "",
            expiryInputError: "",
            cvvError: "",
            nameOnCardError: ""
        },
        creditCard: {
            numberError: "",
            expiryInputError: "",
            cvvError: "",
            nameOnCardError: ""
        },
        upi: {
            vpaError: ""
        },
        netbanking: {
            bankCodeError: ""
        }
    });

    const validateInput = async (cardType, field, value, isUpdate = true) => {
        let error = "";

        switch (field) {
            case "number":
                if (isCardChecked) {
                    setIsCardValid(true);
                    error = "";
                    break;
                }
                let encryptedData = await Utils.encryptData(JSON.stringify({ paymentType: cardType == "debitCard" ? "DC" : "CC", inputValue: value.replace(/[^0-9]/g, "") }), await Utils.decryptData(transactionDetails.encKey));
                const isValidCard = await PaymentService.validate(fetchTransactionId(), encryptedData);
                // error = isValidCard && isValidCard.data && isValidCard.data.isCardValid ? "" : "Invalid card number.. Try again";
                if (isValidCard && isValidCard.data && isValidCard.data.isCardValid) {
                    if (!isUpdate) {
                        let supportedCard = await checkPayUPaymentMethod(merchantId, cardType, field, value.replace(/[^0-9]/g, ""));
                        if (supportedCard) {
                            setIsCardValid(true);
                            error = "";
                            setIsCardChecked(true);
                        } else {
                            setIsCardValid(false);
                            error = "Unsupported card type.. try again";
                            setIsCardChecked(false);
                        }
                    } else {
                        setIsCardValid(true);
                        error = "";
                        setIsCardChecked(false);
                    }
                } else {
                    error = "Invalid card number.. Try again";
                    setIsCardChecked(false);
                }
                break;

            case "expiryInput":
                // Expiry date validation
                if (!/^\d{2}\/\d{2}$/.test(value)) {
                    error = "Invalid expiry date format. Use MM/YY.";
                } else {
                    const [month, year] = value.split("/").map(Number);
                    const currentYear = new Date().getFullYear() % 100;
                    const currentMonth = new Date().getMonth() + 1;
                    if (month < 1 || month > 12) {
                        error = "Invalid month.";
                    } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                        error = "Invalid Expiry date.. Try again";
                    }
                }
                break;

            case "cvv":
                // CVV validation (assuming 3 digits)
                if (!/^\d{3}$/.test(value)) {
                    error = "Invalid CVV. Must be 3 digits.";
                }
                break;

            case "bankCode":
                if (!value) {
                    error = "This field is required!";
                }
                break;

            default:
                break;
        }

        // console.log("error", `${field}Error`, error)

        // Update the error state dynamically
        if (isUpdate) {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [cardType]: {
                    ...prevErrors[cardType],
                    [`${field}Error`]: error,
                },
            }));
        }

        return error;
    };

    const validateCardFields = async (cardType, field, value, isOnBlur = false) => {
        let error = "";

        if (value == null || value.length == 0) {
            return "This Field is required!";
        }

        switch (field) {
            case "number":
                let cardNo = value.replace(/[^0-9]/g, "");
                if (cardNo.length == 0) {
                    setIsCardValid(false);
                    return "This Field is required!";
                }

                if (cardNo.length < 6) {
                    setIsCardValidByHealthCheck({ isValid: false, bin: null });
                    setIsCardValid(false);
                    return "";
                }

                if (isCardValidByHealthCheck.bin != null && isCardValidByHealthCheck.bin == cardNo.substring(0, 6)) {
                    error = isCardValidByHealthCheck.error;
                } else {
                    let supportedCard = await healthCheck(merchantId, cardType, cardNo);
                    setIsCardValidByHealthCheck({ isValid: supportedCard.length == 0, bin: cardNo.substring(0, 6), error: supportedCard });
                    error = supportedCard;
                }

                let validateDigitsArray = [];

                if (cardScheme == "AMEX") {
                    validateDigitsArray = [15];
                } else if (cardScheme == "DINR" || cardScheme == "DISC") {
                    validateDigitsArray = [14, 16];
                } else if (cardScheme == "VISA" || cardScheme == "MAST") {
                    validateDigitsArray = [16, 19];
                } else {
                    validateDigitsArray = [16];
                }

                if (error.length == 0 && validateDigitsArray.includes(cardNo.length)) {
                    error = await validateCardByLungsAlgo(cardType, cardNo);
                    setIsCardValid(error.length == 0);
                } else {
                    setIsCardValid(false);
                    if (isOnBlur && error.length == 0) {
                        error = "Invalid card number.. Try again"
                    }
                }
                break;

            case "expiryInput":
                if (!/^\d{2}\/\d{2}$/.test(value)) {
                    error = "Invalid expiry date format. Use MM/YY.";
                } else {
                    const [month, year] = value.split("/").map(Number);
                    const currentYear = new Date().getFullYear() % 100;
                    const currentMonth = new Date().getMonth() + 1;
                    if (month < 1 || month > 12) {
                        error = "Invalid month.";
                    } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
                        error = "Invalid Expiry date.. Try again";
                    }
                }
                break;

            case "cvv":
                if (!/^\d{3}$/.test(value)) {
                    error = "Invalid CVV. Must be 3 digits.";
                }
                break;

            case "nameOnCard":
                if (value == null || value.length == 0) {
                    error = "This field is required!";
                }
                break;

            case "bankCode":
                if (!value) {
                    error = "This field is required!";
                }
                break;

            default:
                break;
        }

        return error;
    };

    const validateCardByLungsAlgo = async (cardType, cardNo) => {
        let encryptedData = await Utils.encryptData(JSON.stringify({ paymentType: cardType == "debitCard" ? "DC" : "CC", inputValue: cardNo }), await Utils.decryptData(transactionDetails.encKey));
        setScreenLoading(true);
        const isValidCard = await PaymentService.validate(fetchTransactionId(), encryptedData);
        setScreenLoading(false);
        return isValidCard != null && isValidCard.data && isValidCard.data.isCardValid ? "" : "Invalid card number.. Try again";
    }

    const handleInputChange = async (cardType, field, value) => {
        console.log("cartype", cardType, field, value)
        setFormState((prev) => ({
            ...prev,
            [cardType]: {
                ...prev[cardType],
                [field]: value,
            },
        }));

        // if(field == "nameOnCard"){
        //     return;
        // }

        if (cardType == "netbanking") {
            await validateInput(cardType, field, value);
            return;
        }

        let error = await validateCardFields(cardType, field, value);
        if (field == "number") {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [cardType]: {
                    ...prevErrors[cardType],
                    [`${field}Error`]: error,
                },
            }));
        }

        return;

        if (value.length == 0 && field == "number") {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [cardType]: {
                    ...prevErrors[cardType],
                    [`${field}Error`]: "This Field is required!",
                },
            }));
        }

        if (value.length == 7 && field == "number") {
            await checkPayUPaymentMethod(merchantId, cardType, field, value.replace(/[^0-9]/g, ""))
        }

        // Validate the field dynamically
        if (value.length == 19 && field == "number") {
            let val = await validateInput(cardType, field, value.replace(/[^0-9]/g, ""));
            if (val != null && val.length == 0) {
                await checkPayUPaymentMethod(merchantId, cardType, field, value.replace(/[^0-9]/g, ""))
            }
        }
    };

    useEffect(() => {
        // validateConfirmBtn();
        validateConfirmBtnUsingFormErrors();
    }, [JSON.stringify(formState), isCardValid])

    useEffect(() => {
        setPaymentAmount(props.paymentAmount);
    }, [props.paymentAmount])

    const cardCategories = {
        mastercard: "MAST",
        visa: "VISA",
        maestro: "MAES",
        rupay: "RUPAY",
        amex: "AMEX",
        diners: "DINR",
        discover: "DISC",
        rupaycc: "RUPAYCC",
    };

    const reverseMapping = {
        "MAST": "Master cards",
        "VISA": "VISA cards",
        "MAES": "Maestro cards",
        "RUPAY": "Rupay cards",
        "AMEX": "AMEX cards",
        "DINR": "Diners cards",
        "DISC": "Discover cards",
        "RUPAYCC": "Rupay cards",
    };

    const checkPayUPaymentMethod = async (merchId, cardType, field, value) => {

        var result = await validatePaymentMethod(merchId, messages.checkIsDomestic, value)

        if (!result) {
            return false;
        }

        if (true) {
            if (cardType == "debitCard") {
                if (result.cardCategory == "CC") {
                    setFormErrors((prevErrors) => ({
                        ...prevErrors,
                        [cardType]: {
                            ...prevErrors[cardType],
                            [`${field}Error`]: "Invalid Debit card.. try again",
                        },
                    }));
                    return false;
                } else {
                    setFormErrors((prevErrors) => ({
                        ...prevErrors,
                        [cardType]: {
                            ...prevErrors[cardType],
                            [`${field}Error`]: "",
                        },
                    }));
                }
            } else if (cardType == "creditCard") {
                if (result.cardCategory == "DC") {
                    setFormErrors((prevErrors) => ({
                        ...prevErrors,
                        [cardType]: {
                            ...prevErrors[cardType],
                            [`${field}Error`]: "Invalid Credit card.. try again",
                        },
                    }));
                    return false;
                } else {
                    setFormErrors((prevErrors) => ({
                        ...prevErrors,
                        [cardType]: {
                            ...prevErrors[cardType],
                            [`${field}Error`]: "",
                        },
                    }));
                }
            }
        }

        let currentCardScope = result.isDomestic == "Y" ? "1" : "2";
        let activeMethodData = filteredPaymentMethods[activeMethod];

        const isCardSupported = activeMethodData.logos.some((logo) => {
            const brandName = Object.keys(brandLogoMap).find((key) => brandLogoMap[key] === logo);
            setCardScheme(result.cardType)
            return cardCategories[brandName?.toLowerCase()] === result.cardType;
        })

        if (!isCardSupported) {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [cardType]: {
                    ...prevErrors[cardType],
                    [`${field}Error`]: "Unsupported card type.. try again",
                },
            }));
            return false;
        }

        let fetchedData = fetchPaymentDetailsResponse.filter((data) => {
            return data.paymentScope == currentCardScope && activeMethodData.name.toLowerCase() == data.paymentMethodName.toLowerCase() && cardCategories[data.brandName.toLowerCase()] == result.cardType;
        })

        if (fetchedData == null || fetchedData.length == 0) {
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [cardType]: {
                    ...prevErrors[cardType],
                    [`${field}Error`]: `Currently we are not supporting ${currentCardScope == "1" ? "Domestic" : "International"} ${reverseMapping[result.cardType]}.`,
                },
            }));
            return false;
        }

        return true;
    }

    const healthCheck = async (merchId, cardType, value) => {

        var result = await validatePaymentMethod(merchId, messages.checkIsDomestic, value);
        let error = "";

        if (!result) {
            return "Server Error! Please try again after some time";
        }

        if (result.cardType == "Invalid Input" || result.isDomestic == "Invalid Input") {
            return "Invalid card number.. Try again";
        }

        if (cardType == "debitCard") {
            error = result.cardCategory == "CC" ? "Invalid Debit card.. try again" : "";
        } else if (cardType == "creditCard") {
            error = result.cardCategory == "DC" ? "Invalid Credit card.. try again" : "";
        }

        if (error.length != 0) {
            return error;
        }

        let currentCardScope = result.isDomestic == "Y" ? "1" : "2";
        let activeMethodData = filteredPaymentMethods[activeMethod];

        const isCardSupported = activeMethodData.logos.some((logo) => {
            const brandName = Object.keys(brandLogoMap).find((key) => brandLogoMap[key] === logo);
            setCardScheme(result.cardType)
            return cardCategories[brandName?.toLowerCase()] === result.cardType;
        })

        if (!isCardSupported) {
            return "Unsupported card type.. try again";
        }

        let fetchedData = fetchPaymentDetailsResponse.filter((data) => {
            return data.paymentScope == currentCardScope && activeMethodData.name.toLowerCase() == data.paymentMethodName.toLowerCase() && cardCategories[data.brandName.toLowerCase()] == result.cardType;
        })

        if (fetchedData == null || fetchedData.length == 0) {
            error = `Currently we are not supporting ${currentCardScope == "1" ? "Domestic" : "International"} ${reverseMapping[result.cardType]}.`;
        }

        return error;
    }

    const validatePaymentMethod = async (merchantId, command, paramValue) => {
        try {
            setScreenLoading(true);
            const response = await PaymentService.healthCheckApi(merchantId, command, paramValue);
            setScreenLoading(false);

            console.log("healthCheck response", response);
            setCardScheme(response.cardType)

            if (response) {
                return response;
            } else {
                return null;
            }
        } catch (error) {
            console.error("error fetching heathcheck response", error);
        }
    }

    const handleExpiryDateInput = (cardType, value) => {
        // Sanitize input to allow only digits
        let sanitizedValue = value.replace(/\D/g, "").substring(0, 4);

        // Format as MM/YY
        if (sanitizedValue.length > 2) {
            sanitizedValue = `${sanitizedValue.substring(0, 2)}/${sanitizedValue.substring(2)}`;
        }

        setFormState((prev) => ({
            ...prev,
            [cardType]: {
                ...prev[cardType],
                expiryInput: sanitizedValue,
            },
        }));

        // Validate when fully entered
        if (sanitizedValue.length === 5) {
            validateInput(cardType, "expiryInput", sanitizedValue);
        } else {
            // Clear the expiry error while typing
            setFormErrors((prevErrors) => ({
                ...prevErrors,
                [cardType]: {
                    ...prevErrors[cardType],
                    expiryError: "",
                },
            }));
        }
    };

    useEffect(() => {
        var token = fetchTransactionId();
        if (token) {
            getPaymentDetails(token, props && props.paymentDetails ? props.paymentDetails : null);
        }

        let search = window.location.search;
        let params = new URLSearchParams(search);

        var process = params.get("process");

        if (process === "initiated") {
            setPaymentInitiated(true);
        }
    }, []);

    const handleUpiPayment = async () => {
        if (Utils.isMobile()) {
            await handleConfirmPayment(true);
            return;
        }

        let data = formState.upi.vpa;
        let error = "";
        if (Utils.isNullOrEmpty(data)) {
            error = "This field is required!";
        } else {
            // api call here
            let encryptedData = await Utils.encryptData(JSON.stringify({ paymentType: "UP", inputValue: data }), await Utils.decryptData(transactionDetails.encKey));
            let result = await PaymentService.validate(paymentId, encryptedData);
            if (result && result.data && result.data.isCardValid) {
                setPayerVpaName(result.data.payerAccountName);
            } else if (result && result.data) {
                error = result.data.errorMessage ? result.data.errorMessage : "Invalid UPI Id .. Try again";
            } else {
                error = "Invalid UPI Id .. Try again";
            }
        }

        if (!Utils.isNullOrEmpty(error)) {
            setFormErrors((prev) => ({
                ...prev,
                "upi": {
                    vpaError: error
                },
            }));
        }

        if (Utils.isNullOrEmpty(error)) {
            // initate the payment here
            await handleConfirmPayment();
        }

    }

    const fetchTransactionId = () => {
        let search = window.location.search;
        let params = new URLSearchParams(search);
        let token = params.get("token");
        let amount = params.get("amount");
        setTransactionAmount(amount);

        if (!token) {
            const pathParams = window.location.pathname.split('/');
            token = pathParams[1];
        }

        console.log("token ", token);

        return token;
    }

    const handleOnBlur = async (cardType, valueType, value) => {
        // let errors = await validateInput(cardType, valueType, value);
        // if (Utils.isNullOrEmpty(errors)) { await handleInputChange(cardType, valueType, value) }
        let error = await validateCardFields(cardType, valueType, value, true);
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [cardType]: {
                ...prevErrors[cardType],
                [`${valueType}Error`]: error,
            },
        }));
    }

    // Payment Methods Array
    const paymentMethods = [
        {
            name: 'Debit Card',
            beneName: "DC",
            logos: [
                visa, mastercard, maestro, rupay, amex, diners, discover
            ],
            fieldsArray: ["number", "nameOnCard", "expiryInput", "cvv"],
            formStateVariable: "debitCard",
            fields: (formState, formErrors, handleInputChange, handleExpiryDateInput, termsAccepted, handleUpiPayment, netbankingUpList, handleOnBlur) => (
                <>
                    <span className="text-gray-500 text-sm md:text-base">Pay Securely using your VISA, Mastercard, Maestro or RuPay debit card</span>
                    <hr className="mt-3 mb-3 border-gray-300"></hr>
                    <label className="block mb-1">
                        Card Number
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Card number"
                                value={formState.debitCard.number}
                                onChange={(e) => {
                                    setIsCardChecked(false);
                                    handleInputChange("debitCard", "number", e.target.value);
                                }}
                                onInput={(e) => {
                                    // Remove all non-numeric characters
                                    let value = e.target.value.replace(/[^0-9]/g, "");

                                    // Automatically add hyphen after every 4 digits
                                    if (value.length > 0) {
                                        value = value.replace(/(\d{4})(?=\d)/g, "$1-");
                                    }

                                    // Set the input value with a maximum of 19 characters (16 digits and 3 hyphens)
                                    e.target.value = value.substring(0, 23);  // Max length: 16 digits + 3 hyphens
                                }}
                                onBlur={async () => { await handleOnBlur("debitCard", "number", formState.debitCard.number) }}
                                maxLength={23} // Ensures max length is 19
                                className={`w-full p-3 border ${formErrors.debitCard.numberError ? "border-red-500" : "border-gray-300"} rounded mb-2`}
                            />
                        </div>


                        {formErrors.debitCard.numberError && (
                            <span className="text-red-500 text-sm">{formErrors.debitCard.numberError}</span>
                        )}
                    </label>
                    <div className="w-full flex flex-col md:flex-row md:space-x-4">
                        <label className="block w-full md:w-1/2 mb-1">
                            Name on Card
                            <input
                                type="text"
                                placeholder="Cardholder Name"
                                value={formState.debitCard.nameOnCard}
                                onChange={(e) => handleInputChange("debitCard", "nameOnCard", e.target.value)}
                                onBlur={async () => { await handleOnBlur("debitCard", "nameOnCard", formState.debitCard.nameOnCard); }}
                                className="w-full p-3 border border-gray-300 rounded mb-2"
                            />
                        </label>
                        <div className="flex space-x-2 md:space-x-4 w-full md:w-1/2">
                            <div className="block w-1/2 mb-1">
                                <label>Expiry Date</label>
                                <input
                                    type="text"
                                    value={formState.debitCard.expiryInput}
                                    placeholder="MM/YY"
                                    onChange={(e) => handleExpiryDateInput("debitCard", e.target.value)}
                                    onBlur={async () => { await handleOnBlur("debitCard", "expiryInput", formState.debitCard.expiryInput); }}
                                    className={`w-full p-3 border ${formErrors.debitCard.expiryInputError ? "border-red-500" : "border-gray-300"} rounded mb-2`}
                                />
                                {formErrors.debitCard.expiryInputError && (
                                    <span className="text-red-500 text-sm">{formErrors.debitCard.expiryInputError}</span>
                                )}
                            </div>
                            <label className="block w-1/2 mb-1">
                                CVV
                                <input
                                    type="password"
                                    value={formState.debitCard.cvv || ""}
                                    placeholder="CVV"
                                    onChange={(e) => handleInputChange("debitCard", "cvv", e.target.value)}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                    }}
                                    onBlur={async () => { await handleOnBlur("debitCard", "cvv", formState.debitCard.cvv); }}
                                    maxLength={3}
                                    className={`w-full p-3 border ${formErrors.debitCard.cvvError ? "border-red-500" : "border-gray-300"} rounded mb-2`}
                                />
                                {formErrors.debitCard.cvvError && (
                                    <span className="text-red-500 text-sm">{formErrors.debitCard.cvvError}</span>
                                )}
                            </label>
                        </div>
                    </div>

                </>
            )
        },
        {
            name: 'Credit Card',
            beneName: "CC",
            logos: [
                visa, mastercard, maestro, rupay, amex, diners, discover
            ],
            fieldsArray: ["number", "nameOnCard", "expiryInput", "cvv"],
            formStateVariable: "creditCard",
            fields: (formState, formErrors, handleInputChange, handleExpiryDateInput, termsAccepted, handleUpiPayment, netbankingUpList, handleOnBlur) => (
                <>
                    <span className="text-gray-500 text-sm md:text-base">Pay Securely using your VISA, Mastercard, Maestro or RuPay credit card</span>
                    <hr className="mt-3 mb-3 border-gray-300"></hr>
                    <label className="block mb-1">
                        Card Number
                        <input
                            type="text"
                            placeholder="Card number"
                            value={formState.creditCard.number}
                            onChange={(e) => { setIsCardChecked(false); handleInputChange("creditCard", "number", e.target.value) }}
                            onInput={(e) => {
                                // Remove all non-numeric characters
                                let value = e.target.value.replace(/[^0-9]/g, "");

                                // Automatically add hyphen after every 4 digits
                                if (value.length > 0) {
                                    value = value.replace(/(\d{4})(?=\d)/g, "$1-");
                                }

                                // Set the input value with a maximum of 19 characters (16 digits and 3 hyphens)
                                e.target.value = value.substring(0, 23);  // Max length: 16 digits + 3 hyphens
                            }}
                            onBlur={async () => { await handleOnBlur("creditCard", "number", formState.creditCard.number) }}
                            maxLength={23} // Ensures max length is 19
                            className={`w-full p-3 border ${formErrors.creditCard.numberError ? "border-red-500" : "border-gray-300"} rounded mb-2`}
                        />
                        {formErrors.creditCard.numberError && (
                            <span className="text-red-500 text-sm">{formErrors.creditCard.numberError}</span>
                        )}
                    </label>
                    <div className="w-full flex flex-col md:flex-row md:space-x-4">
                        <label className="block w-full md:w-1/2 mb-1">
                            Name on Card
                            <input
                                type="text"
                                placeholder="Cardholder Name"
                                value={formState.creditCard.nameOnCard}
                                onChange={(e) => handleInputChange("creditCard", "nameOnCard", e.target.value)}
                                onBlur={async () => { await handleOnBlur("creditCard", "nameOnCard", formState.creditCard.nameOnCard); }}
                                className="w-full p-3 border border-gray-300 rounded mb-2"
                            />
                        </label>
                        <div className="flex space-x-2 md:space-x-4 w-full md:w-1/2">
                            <div className="block w-1/2 mb-1">
                                <label>Expiry Date</label>
                                <input
                                    type="text"
                                    value={formState.creditCard.expiryInput}
                                    placeholder="MM/YY"
                                    onChange={(e) => handleExpiryDateInput("creditCard", e.target.value)}
                                    onBlur={async () => { await handleOnBlur("creditCard", "expiryInput", formState.creditCard.expiryInput); }}
                                    className={`w-full p-3 border ${formErrors.creditCard.expiryInputError ? "border-red-500" : "border-gray-300"} rounded mb-2`}
                                />
                                {formErrors.creditCard.expiryInputError && (
                                    <span className="text-red-500 text-sm">{formErrors.creditCard.expiryInputError}</span>
                                )}
                            </div>
                            <label className="block w-1/2 mb-1">
                                CVV
                                <input
                                    type="password"
                                    value={formState.creditCard.cvv || ""}
                                    placeholder="CVV"
                                    onChange={(e) => handleInputChange("creditCard", "cvv", e.target.value)}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/[^0-9]/g, ""); // Allow only numeric input
                                    }}
                                    maxLength={3}
                                    onBlur={async () => { await handleOnBlur("creditCard", "cvv", formState.creditCard.cvv); }}
                                    className={`w-full p-3 border ${formErrors.creditCard.cvvError ? "border-red-500" : "border-gray-300"} rounded mb-2`}
                                />
                                {formErrors.creditCard.cvvError && (
                                    <span className="text-red-500 text-sm">{formErrors.creditCard.cvvError}</span>
                                )}
                            </label>
                        </div>
                    </div>
                </>
            )
        },
        {
            name: 'UPI',
            beneName: "UP",
            logos: [
                allUpi,
            ],
            fieldsArray: ["vpa"],
            formStateVariable: "upi",
            fields: (formState, formErrors, handleInputChange, { }, termsAccepted, handleUpiPayment) => (
                <>
                    <label className="block mb-1">
                        <div className="flex w-full items-center justify-between">
                            <p>Enter your UPI Id</p>
                            <button onClick={() => { setUpiModelType("2"); setIsUpiInfoBtnClicked(true) }} className="text-xs text-blue-700 hover:text-blue-600">How to find UPI Id?</button>
                        </div>
                        <input type="text"
                            value={formState.upi.vpa || ""}
                            onChange={(e) => {
                                setPayerVpaName("");
                                setFormState((prev) => ({
                                    ...prev,
                                    "upi": {
                                        vpa: e.target.value
                                    },
                                }));
                                setFormErrors((prev) => ({
                                    ...prev,
                                    "upi": {
                                        vpaError: ""
                                    },
                                }));
                            }}
                            placeholder="9787665431@okicici"
                            className="w-full p-3 border border-gray-300 rounded mb-2" />
                        {formErrors.upi.vpaError && (
                            <span className="text-red-500 text-sm">{formErrors.upi.vpaError}</span>
                        )}
                    </label>
                    <button
                        onClick={handleUpiPayment}
                        disabled={!termsAccepted}
                        className={`${!termsAccepted ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'} w-full text-white py-3 rounded-lg mt-3 mb-2 transition-all duration-200 ease-in-out flex justify-center items-center`}
                    >
                        <p>Verify & Pay</p>
                    </button>
                    <button onClick={() => { setUpiModelType("1"); setIsUpiInfoBtnClicked(true) }} target="_blank" className="text-xs text-blue-700 hover:text-blue-600">How to pay using UPI?</button>
                </>
            )
        },
        {
            name: 'Net Banking',
            beneName: "NB",
            logos: [

            ],
            fieldsArray: ["bankCode"],
            formStateVariable: "netbanking",
            fields: (formState, formErrors, handleInputChange, handleExpiryDateInput, termsAccepted, handleUpiPayment, netbankingUpList, handleOnBlur) => (
                <>
                    <div className="flex w-full items-center justify-between">
                        <p>Choose your bank</p>
                    </div>
                    <Autocomplete
                        disablePortal
                        options={netbankingUpList}
                        onChange={(event, value) => {
                            handleInputChange("netbanking", "bankCode", value);
                        }}
                        getOptionLabel={(option) => option.title}
                        sx={{ width: '100%' }}
                        renderInput={(params) => <TextField {...params} placeholder="E.g. State bank of india" />}
                    />
                    {formErrors.netbanking && formErrors.netbanking.bankCodeError && (
                        <span className="text-red-500 text-sm">{formErrors.netbanking.bankCodeError}</span>
                    )}
                </>
            )
        },
        // {
        //     name: 'Wallets',
        //     beneName: "WALLET",
        //     logos: [
        //         paytm, gpay2, amzonpay, bhmi, phonepe
        //     ],
        //     fields: (
        //         <>
        //             <div className="flex flex-col">
        //                 <button className="p-3 bg-blue-500 text-white rounded mb-2">Paytm</button>
        //                 <button className="p-3 bg-yellow-500 text-white rounded mb-2">Amazon Pay</button>
        //                 <button className="p-3 bg-purple-500 text-white rounded">PhonePe</button>
        //             </div>
        //         </>
        //     )
        // },
        // {
        //     name: 'EMI Payments',
        //     beneName: "EMI",
        //     logos: [

        //     ],
        //     fields: (
        //         <>
        //             <div className="flex flex-col">
        //                 <button className="p-3 bg-blue-500 text-white rounded mb-2">Paytm</button>
        //                 <button className="p-3 bg-yellow-500 text-white rounded mb-2">Amazon Pay</button>
        //                 <button className="p-3 bg-purple-500 text-white rounded">PhonePe</button>
        //             </div>
        //         </>
        //     )
        // },
        // {
        //     name: 'Pay Later',
        //     beneName: "PL",
        //     logos: [

        //     ],
        //     fields: (
        //         <>
        //             <div className="flex flex-col">
        //                 <button className="p-3 bg-blue-500 text-white rounded mb-2">Paytm</button>
        //                 <button className="p-3 bg-yellow-500 text-white rounded mb-2">Amazon Pay</button>
        //                 <button className="p-3 bg-purple-500 text-white rounded">PhonePe</button>
        //             </div>
        //         </>
        //     )
        // },
        // {
        //     name: 'Local Bank Account',
        //     beneName: "LBA",
        //     logos: [

        //     ],
        //     fields: (
        //         <>
        //             <div className="flex flex-col">
        //                 <button className="p-3 bg-blue-500 text-white rounded mb-2">Paytm</button>
        //                 <button className="p-3 bg-yellow-500 text-white rounded mb-2">Amazon Pay</button>
        //                 <button className="p-3 bg-purple-500 text-white rounded">PhonePe</button>
        //             </div>
        //         </>
        //     )
        // }
    ];

    const handleToggle = async (index, beneName) => {
        setIsConfirmBtnVisible(beneName && beneName === "UP");
        let activeBanksAvailable = true;

        if (beneName && beneName == "NB" && netbankingUpList.length == 0) {
            activeBanksAvailable = await getActiveNetbanking();
        }

        setActiveMethod(activeMethod === index ? null : index);

        if (beneName && beneName == "UP" && Utils.isMobile()) {
            await handleConfirmPayment(true, index);
            return;
        }

        setPaymentMethodSelected(!paymentMethodSelected) // Toggle the active section

        setFormState({
            debitCard: {
                number: "",
                nameOnCard: "",
                expiryDate: null,
                expiryInput: "",
                cvv: null,
            },
            creditCard: {
                number: "",
                nameOnCard: "",
                expiryDate: null,
                expiryInput: "",
                cvv: null,
            },
            upi: {
                vpa: ""
            },
            netbanking: {
                bankCode: ""
            },
        });

        setFormErrors({
            debitCard: {
                numberError: "",
                expiryInputError: "",
                cvvError: "",
                nameOnCardError: ""
            },
            creditCard: {
                numberError: "",
                expiryInputError: "",
                cvvError: "",
                nameOnCardError: ""
            },
            upi: {
                vpaError: ""
            },
            netbanking: {
                bankCodeError: activeBanksAvailable ? "" : `NetBanking server is unavailable, please retry after some time...`
            }
        });

        setIsCardValidByHealthCheck({ isValid: false, bin: null });
    };

    const getActiveNetbanking = async () => {

        setLoading(true);
        setScreenLoading(true);
        let response = await PaymentService.healthCheckApi(merchantId, messages.getNetbankingStatus, "default");
        setLoading(false);
        setScreenLoading(false);

        if (response) {
            setNetBankingUpList(getAllNetbankingOptions(response));
            return true;
        } else {
            setNetBankingUpList([]);
            return false;
        }
    }

    const getAllNetbankingOptions = (data) => {
        const activeBanks = [];
        for (const key in data) {
            if (data[key].mode === "NB" && data[key].up_status === 1) {
                activeBanks.push(data[key]);
            }
        }
        console.log("All active banks at this time", activeBanks);
        return activeBanks;
    }

    const checkPaymentStatusBeforeConfirm = async () => {
        let paymentDetailsResponse = await PaymentService.getPaymentDetailsById(paymentId);

        return paymentDetailsResponse && redirectBasedonStatus(paymentDetailsResponse);
    }

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

    const getPaymentDetails = async (token, data = null) => {
        setPaymentId(token);
        setLoading(true);
        console.log("payment id ", paymentId);
        setScreenLoading(true);
        let paymentDetailsResponse = data ? data : await PaymentService.getPaymentDetailsById(token);
        setScreenLoading(false);
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

        // let traceData = data ? data : await PaymentService.createTraceId(token, await Utils.encryptData(paymentAmount, await Utils.decryptData(paymentDetailsResponse.encKey)));
        setScreenLoading(true);
        let traceData = data ? data : await PaymentService.createTraceId(token, paymentAmount);
        setScreenLoading(false);

        setTraceId(traceData.traceId);
        fetchMerchantPaymentMethodPref(paymentDetailsResponse.merchantId, paymentDetailsResponse.requestorTransactionId, paymentDetailsResponse);
        await setMerchantId(paymentDetailsResponse.merchantId);
        await setTransactionDetails(paymentDetailsResponse);
        sessionStorage.setItem("poweredByBp", transactionDetails.poweredByBp);

        // should check partial amount
        if (paymentDetailsResponse.allowPartialPayments) {
            setPayBtnText("Pay Entire Amount");
        }
        setPartial(paymentDetailsResponse.allowPartialPayments);
    };

    const fetchMerchantPaymentMethodPref = async (merchantId, transactionId, transaction) => {
        setScreenLoading(true);
        let paymentDetailsResponse = await PaymentService.fetchMerchantPaymentMethodPreference(merchantId, transactionId);
        setScreenLoading(false);

        setFetchPaymentDetailsResponse(paymentDetailsResponse.data);

        // Check if response data is null or empty
        if (!paymentDetailsResponse?.data || paymentDetailsResponse.data.length === 0) {
            // Show all payment methods if preference is null or empty

            // It will remove all indian payment methods
            let updatedMethods = paymentMethods;
            const internationalPaymentModes = ["DC", "CC", "WALLET"];
            if (transaction && transaction.collectionAmountCurrency != "INR") {
                updatedMethods = updatedMethods.filter((data) => internationalPaymentModes.includes(data.beneName));
            }

            setFilteredPaymentMethods(updatedMethods);

            return;
        }

        const availablePaymentMethods = paymentDetailsResponse.data.map((detail) => ({
            name: detail.paymentMethodName || "", // Default to empty string if null
            brand: detail.brandName || "", // Default to empty string if null
        }));

        setProviderId(paymentDetailsResponse?.data[0]?.paymentProvider);

        const filteredPaymentMethods = paymentMethods.map((method) => {
            const logos = method.logos.filter((logo) => {
                const brandName = Object.keys(brandLogoMap).find((key) => brandLogoMap[key] === logo);
                return availablePaymentMethods.some((payment) => {
                    // Handle null values gracefully
                    return (
                        !payment.name || // If name is null, include it
                        (payment.name.toLowerCase() === method.name.toLowerCase() &&
                            (!payment.brand || payment.brand.toLowerCase() === brandName?.toLowerCase()))
                    );
                });
            });

            if (method.beneName === "NB") {
                let isPresent = availablePaymentMethods.some(
                    (payment) => payment.name && payment.name.toLowerCase() === method.name.toLowerCase()
                );
                if (isPresent) {
                    return { ...method, logos };
                }
            }
            return logos.length > 0 ? { ...method, logos } : null;
        }).filter(Boolean);

        console.log("filtered", filteredPaymentMethods);
        setFilteredPaymentMethods(filteredPaymentMethods);
    };


    const handleConfirmPayment = async (isUpiAndMobile = false, currentActive = -1) => {

        setUpiIntentClicked(isUpiAndMobile);

        if (isUpiAndMobile) {
            setUpiIntentClicked(true);
        }

        setScreenLoading(true);

        let isRedirect = await checkPaymentStatusBeforeConfirm();

        if (isRedirect) {
            setScreenLoading(false);
            return;
        }

        let userInfo = await LocationService.getUserCountry({
            transactionReference: transactionDetails.transactionId,
            traceId: transactionDetails.traceId,
            merchantId: transactionDetails.merchantId
        });

        let active = filteredPaymentMethods[currentActive == -1 ? activeMethod : currentActive];

        if (active) {
            let requestJson = {
                paymentMethod: isUpiAndMobile ? "UI" : active.beneName,
                cardScheme: cardScheme,
                merchantId: merchantId,
                transactionId: transactionDetails.transactionId,
                traceId: traceId != null ? traceId : null,
                s2sClientIp: userInfo && userInfo.ip ? userInfo.ip : "",
                s2sDeviceInfo: userInfo && userInfo.deviceInfo ? userInfo.deviceInfo : "",
            }

            if (transactionDetails.allowPartialPayments) {
                requestJson["paymentId"] = transactionDetails.requestorTransactionId;
            }
            else {
                requestJson["paymentId"] = paymentId;
            }

            if (formState[active.formStateVariable]) {

                let { modifiedRequestJson, errors } = await handleValidationAndRefill(active, requestJson, []);

                if (errors.length != 0) {
                    errors.forEach(element => {
                        toast.error(element);
                    });
                    setScreenLoading(false);
                    return;
                }

                if (modifiedRequestJson && transactionDetails.encKey) {
                    let encryptedJson = await Utils.encryptData(JSON.stringify(modifiedRequestJson), await Utils.decryptData(transactionDetails.encKey));
                    console.log(modifiedRequestJson, encryptedJson);

                    if (encryptedJson != null) {

                        isConfirmBtnClickedRef.current = true;

                        flushSync(() => {
                            setIsConfirmBtnClicked(true);
                        })

                        console.log("after confirm", isConfirmBtnClicked)

                        callPayByCard(paymentId, encryptedJson, transactionDetails.allowPartialPayments && btoa(paymentAmount));
                    }
                }
            }

        }

        setScreenLoading(false);

    }

    const handleValidationAndRefill = async (active, requestJson, errors, isValidatingForConfirmBtn = false) => {
        for (const element of active.fieldsArray) {
            let data = formState[active.formStateVariable][element];

            // Handle required field validation
            if (isValidatingForConfirmBtn && Utils.isNullOrEmpty(data)) {
                errors.push(`${element} is required!`);
                continue;
            }

            // Special validation for 'number' field
            if (element == 'number' && data.length !== 19) {
                errors.push(`Please provide a valid ${element} with 19 digits.`);
                setIsCardChecked(false);
                continue;
            } else {
                requestJson[element] = data;
            }

            try {
                // Validate the field and wait for the result
                let isValid = await validateInput(active.formStateVariable, element, data, !isValidatingForConfirmBtn);

                if (isValid && isValid.length !== 0) {
                    // If the validation returns an error message, add it to errors
                    errors.push(isValid);
                } else {
                    // Special handling for 'bankCode' if it has an associated 'ibibo_code'
                    if (element === "bankCode" && data && data.ibibo_code && data.ibibo_code.length !== 0) {
                        requestJson[element] = data.ibibo_code;
                    } else {
                        requestJson[element] = data;
                    }
                }
            } catch (error) {
                // Catch any errors that might occur during the API call in validateInput
                errors.push(`Error validating ${element}: ${error.message}`);
            }
        }
        return { modifiedRequestJson: requestJson, errors: errors };
    };

    const validateConfirmBtn = async () => {
        let active = filteredPaymentMethods[activeMethod];
        if (active && formState[active.formStateVariable]) {
            let { modifiedRequestJson, errors } = await handleValidationAndRefill(active, {}, [], true);
            setIsConfirmBtn(modifiedRequestJson != null && errors.length == 0);
        }
    }

    const validateConfirmBtnUsingFormErrors = async () => {
        let active = filteredPaymentMethods[activeMethod];
        let isValid = true;

        if (active && formState[active.formStateVariable]) {

            for (const element of active.fieldsArray) {
                let data = formState[active.formStateVariable][element];

                // Handle required field validation
                if (element == 'number') {
                    continue;
                }

                if (element === "bankCode" && data && data.ibibo_code && data.ibibo_code.length !== 0) {
                    continue;
                }

                let error = await validateCardFields(active.formStateVariable, element, data);
                if (error.length != 0) {
                    isValid = false;
                }

            }

            if (active.beneName == "DC" || active.beneName == "CC") {
                setIsConfirmBtn(isValid && isCardValid && isCardValidByHealthCheck.isValid);
            } else {
                setIsConfirmBtn(isValid);
            }
        } else {
            setIsConfirmBtn(false);
        }
    }

    const callPayByCard = async (paymentId, data, amount) => {
        let url = `${baseUrl}${urls.payByCard}${paymentId}/${data}`;
        if (amount) {
            url += `?payload=${amount}`;
        }
        window.location.href = url;
    };

    const handleTerms = () => {
        setTermsAccepted(!termsAccepted);
    }

    const isNavigatingRef = useRef(false);

    const handleTabClose = (event) => {
        console.log('beforeunload event triggered');
        console.log("isConfirmBtnClicked (from ref)", isConfirmBtnClickedRef.current);
        console.log("isNavigating (from ref)", isNavigatingRef.current);

        if (traceId && !isConfirmBtnClickedRef.current && !isNavigatingRef.current) {
            const url = `${baseUrl}${urls.postBrowserEvent}${traceId}/${messages.closed}`;
            console.log("Sending data to URL:", url);
            const data = JSON.stringify({ traceId });
            navigator.sendBeacon(url, data);
        }
    };

    useEffect(() => {
        window.addEventListener('beforeunload', handleTabClose);

        return () => {
            window.removeEventListener('beforeunload', handleTabClose);
        };
    }, [traceId, isConfirmBtnClicked]);

    const handlePaymentCancellation = async (traceId, type) => {
        setScreenLoading(true);

        isNavigatingRef.current = true;

        await PaymentService.handlePaymentDeclines(traceId, type);
        setScreenLoading(false);

        let redirectionUrl = transactionDetails.curl.replace("trace_id_value", traceId);

        window.location.href = redirectionUrl;
    };

    return (
        <>
            {screenLoading && <div className="z-[100] bg-[#00000033] w-full h-full fixed top-0 left-0 flex justify-center items-center">
                <svg
                    className="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="text-blue-500 opacity-75"
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
            </div>}

            <UpiInfoModal
                isBtnClicked={isUpiInfoBtnClicked}
                setIsBtnClicked={setIsUpiInfoBtnClicked}
                type={upiModelType}
            />

            <div className="h-full min-h-fit bg-white font-roboto">
                {/* Main Content */}
                <div className="container h-full min-h-fit mx-auto px-4 py-6 flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-1">
                    {/* Left Section: Payment Methods */}
                    <div className="flex-1 h-full bg-white shadow rounded-md p-6 text-base drop-shadow-xl min-h-fit">
                        <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                        <p className="text-gray-600 mb-6">All transactions are secure and encrypted</p>

                        {filteredPaymentMethods.map((method, index) => (
                            <div key={index} className="mb-4">
                                <button
                                    onClick={() => handleToggle(index, method.beneName)}
                                    className="w-full shadow-md text-left p-3 bg-gray-100 rounded-lg flex justify-between items-center"
                                >
                                    <span style={{ fontWeight: activeMethod === index && paymentMethodSelected ? "bold" : "normal", color: activeMethod === index && paymentMethodSelected ? '#3B82F6' : 'black' }}>{method.name}</span>
                                    <div className="flex space-x-[1px] md:space-x-2">
                                        {method.name === "Net Banking" ? (
                                            // <span style={{ color: 'black' }}>All Major Banks</span>
                                            <img key={`nb-logo`} src={netbankingLogo} alt={`Net Banking logo`} className="h-7" />
                                        ) : (
                                            method.logos.map((logo, logoIndex) => (
                                                <img key={logoIndex} src={logo} alt={`${method.name} logo`} className="h-7" />
                                            ))
                                        )}
                                    </div>
                                </button>
                                {activeMethod === index && (
                                    <div className="mt-4 border border-gray-300 p-4 rounded-lg">
                                        {method.fields(formState, formErrors, handleInputChange, handleExpiryDateInput, termsAccepted, handleUpiPayment, netbankingUpList, handleOnBlur)}
                                    </div>
                                )}
                            </div>
                        ))}

                    </div>

                    {/* Right Section: Transaction Summary */}
                    {paymentAmount && <div className="lg:w-[35%] h-fit lg:h-full bg-white shadow rounded-md p-6 text-base relative drop-shadow-xl ">
                        <h3 className="text-lg font-bold mb-4">Transaction Summary</h3>
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-700">Final Payment Amount</span>
                            <span className="text-gray-900"> {getSymbolFromCurrency(
                                transactionDetails.collectionAmountCurrency
                            )}{" "}
                                {transactionDetails.allowPartialPayments ? paymentAmount : transactionDetails.finalDueAmount}</span>
                        </div>
                        {/* {!isPartial && (
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-700">Charges / Taxes</span>
                            <span className="text-gray-900">{getSymbolFromCurrency(
                                transactionDetails.collectionAmountCurrency
                            )}{" "}{transactionDetails.charges}</span>
                        </div>
                        )} */}
                        <div className="flex justify-between mb-4">
                            <span className="text-gray-700">Description</span>
                            <span className="text-gray-900">
                                {transactionDetails.reasonForCollection}</span>
                        </div>
                        <div className="mb-4">
                            <hr class="border-gray-500 border-t-2" />
                        </div>
                        <div className="flex justify-between font-bold text-lg mb-4">
                            <span>Total</span>
                            <span className="text-2xl -mt-1 font-semibold">{getSymbolFromCurrency(
                                transactionDetails.collectionAmountCurrency
                            )}{" "}
                                {transactionDetails.allowPartialPayments ? paymentAmount : transactionDetails.finalDueAmount}</span>
                        </div>
                        {/* {console.log("termsAccepted", termsAccepted, "isConfirmBtn", isConfirmBtn, "COmbined", (!termsAccepted && !isConfirmBtn) ? "true" : "false", !termsAccepted && !isConfirmBtn, !(termsAccepted && isConfirmBtn), !(termsAccepted || isConfirmBtn))} */}
                        {!isConfirmBtnVisible && <button
                            className={`${!(termsAccepted && isConfirmBtn) ? 'bg-gray-500' : 'bg-blue-500'} w-full text-white p-3 rounded font-semibold`}
                            disabled={!(termsAccepted && isConfirmBtn)}
                            onClick={() => { handleConfirmPayment(false) }}
                        >
                            Confirm Payment
                        </button>}

                        <div className="flex items-start space-x-2 mt-4">
                            {false && <input type="checkbox" className="mt-1" onClick={() => handleTerms()} />}
                            <span className="text-sm text-gray-600">
                                I agree to Benepay's &nbsp;
                                <a
                                    href="https://benepay.io/terms-and-conditions/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#3B82F6' }}
                                >
                                    Terms & Conditions
                                </a>
                                <span>&nbsp;and&nbsp;</span>
                                <a
                                    href="https://benepay.io/privacy-policy/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#3B82F6' }}
                                >
                                    Privacy Policy
                                </a>
                            </span>
                        </div>
                        <div className="flex justify-center mt-4 mb-12 lg:mb-0">
                            <button className="text-blue-500" onClick={() => setOpenCancellPaymentAlertBox(true)}>
                                Cancel Payment
                            </button>
                        </div>
                        <div className="absolute flex justify-end right-0 bottom-0 md:mt-0" style={{ marginTop: '0%' }} >
                            <a href="#" className="-m-1.5 p-1.5 flex items-center justify-center">
                                <p className="text-sm font-medium tracking-tight text-blue-700">Powered By</p>
                                <img className="h-16 w-auto" src={benepayLogo} alt="" />
                            </a>
                        </div>
                    </div>}
                </div>
            </div>

            {/* UPI Intent Processing Page */}
            {upiIntentClicked &&
                <UpiIntentProcessing statusUrl={`${baseUiUrl}/status?traceId=${traceId}&paymentId=${transactionDetails.transactionId}`} intentOpened={intentOpened} setIntentOpened={setIntentOpened} />
            }
            <AlertDialog
                open={openCancellPaymentAlertBox}
                cancelBtnLabel="Cancel"
                confirmBtnLabel="Confirm"
                confirmOnClick={() => handlePaymentCancellation(traceId, messages.cancelled)}
                cancelOnClick={() => setOpenCancellPaymentAlertBox(false)}
                cancelBtnDisabled={screenLoading}
                confirmBtnDisabled={screenLoading}
            >
                <Grid container >
                    <Grid item sx={12}>
                        <Typography style={{ color: 'black', fontSize: '20px', fontWeight: 'normal' }} noWrap>Are you sure you want to cancel this payment?</Typography>
                    </Grid>
                </Grid>
            </AlertDialog>

        </>
    );
};

const mapStateToProps = (state) => {
    return {
        device: state.device,
    };
};

export default connect(mapStateToProps)(SeamlessPaymentPage);