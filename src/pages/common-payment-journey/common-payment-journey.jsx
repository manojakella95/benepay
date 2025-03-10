import { useEffect, useState } from "react"
import { PaymentService } from "../../service/api/payment.service";
import { useNavigate } from "react-router";
import { baseUiUrl, baseUrl, urls } from "../../config/urlConfig";
import React from "react";
import moment from "moment";
import SeamlesPaymentDetails from "../seamless-payment-page/payment-details";
import PaymentDetails from "../payment-details/payment-details";

const CommonPaymentJourney = (props) => {

    const navigate = useNavigate();
    const [paymentInitiated, setPaymentInitiated] = useState(false);
    const [transactionDetails, setTransactionDetails] = useState({});
    const [paymentId, setPaymentId] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [isDisabled, setDisabled] = useState(false);
    const [isPaymentProcessing, setPaymentProcessing] = useState(false);
    const [isSeamless, setIsSeamless] = useState(null);

    useEffect(() => {
        var token = fetchTransactionId();

        if (token) {
            getPaymentDetails(token);
        }

        let search = window.location.search;
        let params = new URLSearchParams(search);

        var process = params.get("process");

        if (process === "initiated") {
            setPaymentInitiated(true);
        }

    }, []);

    useEffect(() => {
        if (transactionDetails) {
            setIsSeamless(transactionDetails.isSeamlessEnabled);
        }
    }, [transactionDetails])

    const fetchTransactionId = () => {
        let search = window.location.search;
        let params = new URLSearchParams(search);
        let token = params.get("token");

        if (!token) {
            const pathParams = window.location.pathname.split('/');
            token = pathParams[1];
        }

        return token;
    }

    const getPaymentDetails = async (token) => {
        setPaymentId(token);
        setLoading(true);

        let paymentDetailsResponse = await PaymentService.getPaymentDetailsById(token);

        if (!paymentDetailsResponse) {
            setLoading(false);
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

        // redirecting if already paid
        if (paymentDetailsResponse && paymentDetailsResponse.paymentStatus && paymentDetailsResponse.paymentStatus.toUpperCase() === "PAID") {

            setTimeout(() => {
                navigate("/payment-already-paid", {
                    state: {
                        payment: paymentDetailsResponse,
                    },
                });
            }, 2000);
            return;
        }

        if (paymentDetailsResponse && paymentDetailsResponse.paymentStatus && paymentDetailsResponse.paymentStatus.toUpperCase() === "IN_PROCESS") {
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

        if (
            (paymentDetailsResponse && paymentDetailsResponse.paymentStatus &&
                paymentDetailsResponse.paymentStatus.toString().toUpperCase() ===
                "PARTIALLY_REFUNDED") ||
            paymentDetailsResponse.paymentStatus.toString().toUpperCase() ===
            "FULLY_REFUNDED" ||
            paymentDetailsResponse.paymentStatus.toString().toUpperCase() ===
            "REFUNDED"
        ) {
            navigate("/refund-issued", {
                state: {
                    payment: paymentDetailsResponse,
                },
            });

            return true;
        }

        setLoading(false);

        if (
            paymentDetailsResponse.finalDueDate &&
            paymentDetailsResponse.finalDueDate !== null
        ) {
            const date = new Date(
                paymentDetailsResponse.finalDueDate.replace("IST", "")
            );
            paymentDetailsResponse.finalDueDate = moment(date).format("DD-MMM-YYYY");
        }

        paymentDetailsResponse.transactionId = paymentDetailsResponse.requestorTransactionId;
        await setTransactionDetails(paymentDetailsResponse);
        sessionStorage.setItem("poweredByBp", transactionDetails.poweredByBp);

    };

    return <>
        {isSeamless == null ? <>
            <div className="w-screen h-screen flex justify-center items-center">
                <svg
                    className="animate-spin -ml-1 mr-3 h-12 w-12 text-blue-500"
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
            </div>
        </>
            : <SeamlesPaymentDetails paymentDetails={transactionDetails} />}
    </>;
}

export default CommonPaymentJourney;