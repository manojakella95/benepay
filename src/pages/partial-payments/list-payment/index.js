import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { PaymentService } from "../../../service/api/payment.service";

const PaymentList = (props) => {
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
        if(!props.lastTxn && paymentDetailsResponse.paymentList &&  paymentDetailsResponse.paymentList.length > 0){
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

            {isLoading ? <div className="loader" style={{ marginTop: '80px' }}>

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
                Loading previous payment details....

            </div> :
                paymentList && paymentList.length > 0 && (
                    <div className="dark:text-white p-6 py-3 bg-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                        <div class="grid grid-cols-4 gap-4">
                            <div class="col-span-3">
                                <h5 className="font-bold dark:text-white row-span-1">Previous Payment Details</h5>
                            </div>
                            <div class="text-end pr-1">
                                {isDataViewed ? (
                                    <FontAwesomeIcon
                                        icon={faAngleUp}
                                        onClick={() => {
                                            toggleDataView();
                                            togglePaymentDetails();
                                        }}
                                        className="text-gray-500 dark:text-white underline cursor-pointer"
                                        style={{ fontSize: "16px" }}
                                    />
                                ) : (
                                    <FontAwesomeIcon
                                        icon={faAngleDown}
                                        onClick={() => {
                                            toggleDataView();
                                            togglePaymentDetails();
                                        }}
                                        className="text-gray-500 dark:text-white underline cursor-pointer"
                                        style={{ fontSize: "16px" }}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="divider bg-purple-900 w-full"
                            style={{ height: "1.5px" }}></div>
                        <div>
                            <div>
                                {showPaymentDetails && (
                                    <ul className="space-y-4 text-left text-gray-500 dark:text-white">
                                        {paymentList.map((payment, i) => (
                                            <li key={i} className="flex items-center space-x-3 rtl:space-x-reverse">
                                                <FontAwesomeIcon icon={faCircleCheck} style={{ color: "green" }} />
                                                <span>{payment.paymentDate}</span>
                                                <span>{payment.currency} {payment.amount}</span>
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

export default PaymentList; 