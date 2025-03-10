import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import getSymbolFromCurrency from "currency-symbol-map";
import { faCircleCheck, faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { PaymentService } from "../../../service/api/payment.service";

const SeamlesPaymentList = (props) => {
    const [paymentList, setPaymentList] = useState([]);
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);
    const [isDataViewed, setIsDataViewed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if(props.transactionId != "" && props.transactionId != null){ 
            updatePayments();
        }
    }, [props.transactionId]);

    const updatePayments = async () => {
        setIsLoading(true);
        let paymentDetailsResponse = await PaymentService.getPaymentsByTransactionId(props.transactionId);

        setIsLoading(false);
        if(!props.lastTxn && paymentDetailsResponse.paymentList.length > 0){
            var withOutCurrentPayment = paymentDetailsResponse.paymentList.slice(0, -1);
            await setPaymentList(withOutCurrentPayment);
        }
        else{
            if (paymentDetailsResponse && paymentDetailsResponse.paymentList && paymentDetailsResponse.paymentList.length > 0) {
                await setPaymentList(paymentDetailsResponse.paymentList);
            }
        }
    }
    const togglePaymentDetails = () => {
        setShowPaymentDetails(!showPaymentDetails);
    }
    const toggleDataView = () => {
        setIsDataViewed(!isDataViewed);
    };

    return (
        <div className="payments">

            {isLoading ? <div className="flex justify-start items-center">
                <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-400"
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
                Loading previous payment details....

            </div> :
                paymentList && paymentList.length > 0 && (
                    <div className="pb-3 w-auto min-w-max">
                        <div className="grid grid-cols-2">
                            <div className="col-span-1">
                                <h5>Previous payments</h5>
                            </div>
                            <div className="inline-flex w-auto items-center pl-3 cursor-pointer"
                                onClick={() => {
                                    toggleDataView();
                                    togglePaymentDetails();
                                }}>
                                <p className="font-semibold mr-2">
                                    {(props.paymentCurrency ? getSymbolFromCurrency(props.paymentCurrency) : " ") + " " + (props.paymentAmount ? props.paymentAmount : "")}
                                </p>
                                {isDataViewed ? (
                                    <FontAwesomeIcon icon={faAngleUp} />
                                ) : (
                                    <FontAwesomeIcon icon={faAngleDown} />
                                )}
                            </div>
                        </div>

                        <div>
                            <div>
                                {showPaymentDetails && (
                                    <ul className="w-auto min-w-max space-y-4 pt-3 text-left text-gray-500">
                                        {paymentList.map((payment, i) => (
                                            <li key={i} className="flex w-full space-x-3 rtl:space-x-reverse">
                                                <div className="flex items-center space-x-2">
                                                    <FontAwesomeIcon icon={faCircleCheck} style={{ color: "green" }} />
                                                    <span>{payment.paymentDate}</span>
                                                    <span className="mx-2">-</span>
                                                    <span>{getSymbolFromCurrency(payment.currency)} {payment.amount}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                )}
        </div>
    );
};

export default SeamlesPaymentList; 