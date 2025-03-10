import axios from 'axios';

export default class LocationService {

    static  apiKey = 'c18ec0a85d914aae90b9c6197657b3b8'

    static config = {
        url: `https://api.ipgeolocation.io/ipgeo?apiKey=${this.apiKey}`
    };

/**
   * Method to fetch the payer's country using the browser's IP location.
   * 
   * @param {Object} payment - The payment object containing transaction details.
   * @returns {Object|null} An object with the payer's account country and transaction details or null if an error occurs.
   */   
   static async getUserCountry(payment){
        console.log("paymentpayment",payment);
        try {
            const response = await axios.get(this.config.url);
            console.log("paymentpayment",response);

            if( response.data) {
                return {
                payerAccountCountry: response.data.country_name,
                fktransactionId: payment.transactionReference,
                traceId:payment.traceId,
                merchantId:payment.merchantId,
                ip: response.data.ip,
                deviceInfo: navigator.userAgent.toLowerCase(),
            };
                
            }
        } catch (e) {
            console.log(e);
            return null;
        }
    }

   

}