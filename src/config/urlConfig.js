import { config } from './config'
import { Environment } from '../enum/common.enum'

export const baseUrl = process.env.REACT_APP_BASE_API_URL;
export const baseUiUrl = process.env.REACT_APP_BASE_UI_URL;

export const NTTDataUatUrl = "https://paynetzuat.atomtech.in/ots/payment/txn"

export const commonRedirectUrl = "https://www.benepay.io/";

export const urls = {
    getPaymentDetails: '/v1/paymentDetails/',
    getPaymentStatus:'/v1/showstatus/',
    payByCard: '/v1/paybycard/',
    initiatePayment: '/v2/initiatePayment/',
    sendPaymentNotification: '/v2/sendPaymentNotification/',
    getToken: '/v2/getToken',
    getPayments: 'v2/getPartialPayments/',
    currencyDecimals : '/v2/getCurrencyDecimals',
    paymentUrl: "/v2/NTTPayments/getDataUrl",
    sendPayerCountry:"/v2/payerCountry",
    checkOnlinePayment: '/v1/paymentStatus/',
    validate: "/v2/validate/",
    fetchMerchantPaymentMethodPreference:'/v2/fetchMerchantPaymentPreference/',
    healthCheckApi : '/v2/paymentMethods/healthCheck',
    createTraceId: '/v2/createTrace/',
    postBrowserEvent: '/v2/browserEvent/',
    paymentInitiateRequest: '/v2/createPaymentProcess',
    userInfo: '/v2/userMerchantInfo',
    getAllowdedCurrencyDecimals: "/v2/getMerchantAllowdedCurrencyDecimals",
    getMerchantPreferences: "/v2/fetchMerchantPreferences",
};

console.log("IN UrlConfig", config.env, baseUiUrl, baseUrl);