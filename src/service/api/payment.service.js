import { urls } from "../../config/urlConfig";
import { HTTP } from "../core/http.service";

export class PaymentService {

    static getPaymentDetailsById = async (paymentId) => {
        console.log(paymentId, "paymentId");
        const result = await HTTP.get(`${urls.getPaymentDetails}${paymentId}`);
        // console.log('result ', result)
        if (result && result.data) {
            return result.data;
        }
        return undefined;
    };

    static getPaymentStatus = async (beneId, payEngineId) => {
        const result = await HTTP.get(`${urls.getPaymentStatus}${beneId}/${payEngineId}`);
        if (result && result.data) {
            return result.data;
        }
        return undefined;
    };

    static doPaymentByCard = async (req, paymentId) => {
        const result = await HTTP.get(`${urls.payByCard}${paymentId}`, {headers: { },
        maxRedirects: 0}, {responseType: 'document'});
        if (result && result.data) {
            return result.data;
        }
        return undefined;
    }

    static sendEmail = async (paymentId) => {
        console.log('payment id ', paymentId);
        const result = await HTTP.get(`${urls.sendPaymentNotification}${paymentId}`);
        if (result && result.data) {
            return result.data;
        }
        return undefined;
    }

    static getTokenById = async (Id) => {
        console.log(Id, "Id");
        const result = await HTTP.get(`${urls.getToken}/${Id}`);
        console.log('result ', result)
        if (result && result.data) {
            return result.data;
        }
        return undefined;
    };

    static getPaymentsByTransactionId = async (paymentId) => {
        const result = await HTTP.get(`${urls.getPayments}${paymentId}`);
        
        if (result && result.data) {
            return result.data;
        }
        
        return undefined;
    };
    
    static fetchCurrencyDecimals = async () => {
        const url = `${urls.currencyDecimals}`
        const result = await HTTP.get(url)

        if (result.status == 200) {
            return result;
        }

        return undefined
    }
    
    static fetchPaymentUrl = async () => {
        const url = `${urls.paymentUrl}`
        const result = await HTTP.get(url)

        if (result.status === 200) {
            return result;
        }

        return undefined
    }

    static initiatePayment = async (paymentId) => {
        const url = `${urls.initiatePayment}${paymentId}`

        const result = await HTTP.get(url)
        console.log("result",result);
        if (result.status === 200) {
            return result;
        }

        return undefined
    }

    //Method for send the payer country to api 
    static sendPayerCountry = async (payerCountry) => {
        const result = await HTTP.post(urls.sendPayerCountry,payerCountry);
        if (result && result.data) {
            return result.data;
        }
        return undefined;
    }
    
    // to check the online paymentstatus
    static getOnlinePaymentStatus = async (paymentId) => {
        const result = await HTTP.get(`${urls.checkOnlinePayment}${paymentId}`);

        if (result && result.data) {
            return result.data;
        }

        return undefined;
    }; 

    static validate = async (type, input) => {
        let uri = `${urls.validate}${type}/${encodeURIComponent(input)}`;
        const result = await HTTP.get(uri);

        if(result){
            return result;
        }

        return undefined;
    } 
    
    static fetchMerchantPaymentMethodPreference = async (merchantId, transactionId) => {
        const result = await HTTP.get(`${urls.fetchMerchantPaymentMethodPreference}${merchantId}/${transactionId}`);

        if(result){
            return result;
        }

        return undefined;
    }

    static healthCheckApi = async (merchantId, command, paramValue) => {
        const result = await HTTP.post(`${urls.healthCheckApi}?merchantId=${merchantId}&command=${command}&var1=${paramValue}`);

        if(result){
            return result.data;
        }

        return undefined;
    }

    static createTraceId = async (paymentId, collectionAmount) => {
        const result = await HTTP.get(`${urls.createTraceId}${paymentId}/${collectionAmount}`);
        // console.log('result ', result)
        if (result && result.data) {
            return result.data;
        }
        return undefined;
    };

    static handlePaymentDeclines = async (traceId, type) => {
        await HTTP.post(`${urls.postBrowserEvent}${traceId}/${type}`);
    }
    // To Encrypt Payment
    static processPayload = async (paymentPayload, token) => {
        try {
            const headers = {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const result = await HTTP.post(`${urls.paymentInitiateRequest}`, paymentPayload, { headers });

            if (result && result.data) {
                return result.data; // Return the response data from the encryption service
            }

            return undefined;
        } catch (error) {
            console.error("Error processing payment:", error);
            return undefined;
        }
    };

    static getUserInfo = async (token) => {
        try {
            const headers = {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            };
            const result = await HTTP.get(`${urls.userInfo}`, { headers });

            console.log(result);
            if (result && result.data) {
                return result.data; // Return the response data from the encryption service
            }

            return undefined;
        } catch (error) {
            console.error("Error processing payment:", error);
            return undefined;
        }
    };

    static getAllowdedCurrencyDecimals = async (token) => {

        try {
            const headers = {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const result = await HTTP.get(`${urls.getAllowdedCurrencyDecimals}`, { headers });

            console.log(result);
            if (result) {
                return result;
            }
            return undefined;
        } catch (error) {
            console.error("Error processing payment:", error);
            return undefined;
        }
    };
    
    static getMerchantPreferences = async (token) => {

        try {
            const headers = {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const result = await HTTP.get(`${urls.getMerchantPreferences}`, { headers });

            console.log(result);
            if (result) {
                return result;
            }
            return undefined;
        } catch (error) {
            console.error("Error processing payment:", error);
            return undefined;
        }
    };

    




}
