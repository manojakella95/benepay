import React, { useEffect, useState } from "react";

import { connect } from "react-redux";
import { PaymentService } from "../../service/api/payment.service";
import { useLocation, useParams } from "react-router";
import AppHeader from "../../components/app-frame/app-header/app-header";
import AppFooter from "../../components/app-frame/app-footer/app-footer";
import Validator from "../../service/core/validator";
import { FormControl, InputLabel, TextField, styled } from "@mui/material";
import MUIPhoneInput from "../../components/input-components/MuiPhoneInput";
import SeamlessPaymentPage from "../seamless-payment-page/seamless-payment-page";
import HorizontalNonLinearStepper from "../seamless-payment-page/layout/stepper";
import Layout from "../seamless-payment-page/layout";
import benepayLogo from "../seamless-payment-page/layout/asset/benepay-transperent.png";
import { toast } from "react-toastify";


export const CustomInputLabel = styled(InputLabel)(() => ({
  "& .MuiFormLabel-asterisk": {
    color: "red"
  }
}));


const PaymentRequestInitiate = (props) => {


  const { merchantId } = useParams(); // Extract token from the URL
  const { device } = props;
  const location = useLocation();
  const [isLoading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const [currencyList, setCurrencyList] = useState([]);
  const [userCountryCodes, setCountryCodes] = useState([]);
  const [isPaymentProcessing, setPaymentProcessing] = useState(false);
  const [payBtnText, setPayBtnText] = useState("Pay Now");
  const [customPaymentPage, setCustomPaymentPage] = useState(true);
  

  const [userInfo, setUserInfo] = useState({
    logoUrl: '',

  });

  useEffect(() => {

    getMerchantPreferences(token).then(() => {
      getSupportedCurrency(token);
      getUserInfo(token);
    });

    if (redirectUrl) {
      window.location.href = redirectUrl;
    }

    if (userCountryCodes.length > 0 && !formData.selectedCountryCode) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        selectedCountryCode: userCountryCodes[0].lookupCode,
      }));
    }
  }, [merchantId, token, redirectUrl]);

  useEffect(() => {
    if(!customPaymentPage){
      window.location.href = "/maintenance?title=Unauthorized&message=You are not authorized to access this data";
    }
  }, [customPaymentPage]);



  const [formData, setFormData] = useState({
    payerName: "",
    payerEmail: "",
    paymentAmount: "",
    description: "",
    payerMobileNumber: "",
    selectedCountryCode: "",
    selectedCurrency: "",
    payerMobileDialCode: "+91", 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Generic function to update form fields
  const updateFormField = async (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle phone number change
  const handlePhoneChange = async (value, countryData) => {
    let dialCode = `+${countryData.dialCode}`;
    // Dynamically update dial code & country code
    await updateFormField("mobileCountry", countryData.countryCode);
    await updateFormField("payerMobileDialCode", dialCode);
    await updateFormField("payerMobileNumber", value);
  };

  // Handle phone number formatting on blur
  const handlePhoneBlur = (e) => {
    let value = e.target.value;
    let dialCode = formData.payerMobileDialCode;

    if(!formData.payerMobileNumber || !value || value.length < 4){
      return;
    }

    // Remove the dial code from the input number to extract only the mobile number
    let mobileNo = value.replace(dialCode, "").trim();

    // Remove all hyphens or spaces from the extracted mobile number
    mobileNo = mobileNo.replace(/[-\s]/g, "");

    // Ensure final format as "+<Dial Code>-<Number>"
    let formattedNumber = `${dialCode}-${mobileNo}`;

    setFormData((prev) => ({
      ...prev,
      payerMobileNumber: formattedNumber, // ✅ Correctly formatted number
    }));
  }; 

  const handleEmail = (e) => {
    const email = e.target.value;
    const reg = /^[a-z]+([a-z0-9_.])*@[a-z]+(\.[a-z]+)+$/i;
  
    if (email && !reg.test(email)) {
      toast.error("Invalid email format");
      return;
    }
  
    setFormData((prev) => ({
      ...prev,
      payerEmail: email, // ✅ Correctly updates the state with the email
    }));
  };
  

  const getUserInfo = async (token) => {
    if (token) {
      try {
        setLoading(true);

        const response = await PaymentService.getUserInfo(token);
        if (!response) {
          return;
        }
        setUserInfo({
          logoUrl: response.logo,
        });

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Failed to fetch user info:", error);
      }
    }
  };

  const getSupportedCurrency = async (token) => {
    if (token) {
      setLoading(true);
      const response = await PaymentService.getAllowdedCurrencyDecimals(token);
      if (response && response.data && response.data.currencyList.length > 0) {
        setCurrencyList(response.data.currencyList)

        if (response.data.currencyList.length > 0 && formData.selectedCurrency == "") {
          setFormData((prevFormData) => ({
            ...prevFormData,
            selectedCurrency: response.data.currencyList[0].code,
          }));
        }
        setLoading(false);

      } else {
        setLoading(false);
      }
    }
  }
  
  const getMerchantPreferences = async (token) => {
    if (token) {
      setLoading(true);
      
      const response = await PaymentService.getMerchantPreferences(token);
      if (response && response.data && response.data.allowPaymentByCpp) {
        setCustomPaymentPage(response.data.allowPaymentByCpp);
      } else {
        setCustomPaymentPage(false);
      }

      setLoading(false);
    }
  }

  const updateDecimal = (amount, currency) => {

    // If currency is not provided, simply update the state with the entered value
    if (!currency) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        paymentAmount: amount,
      }));
      return;
    }

    let filteredCurrency = currencyList.find((v) => v.code === currency);
    if (filteredCurrency) {
      let decimal = filteredCurrency.decimal;
      let isValidDecimal = Validator.isValidDecimal(amount, decimal);
      if (!isValidDecimal) {
        let decimalUpdatedAmount = parseFloat(amount).toFixed(decimal);
        setFormData((prevFormData) => ({
          ...prevFormData,
          paymentAmount: decimalUpdatedAmount,
        }));
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          paymentAmount: amount,
        }));
      }
    }
  };





  const goBack = (url) => {
    window.location.href = "https://benepay.io/"
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (!formData.payerName || !formData.paymentAmount || !formData.description) {
      toast.error("Please provide the mandatory fields data");
      setLoading(false);
      return;
    }

    const generateTransactionId = () => {
      return `Bene-${Date.now()}`;
    };

    const getCurrentDateFormatted = (daysToAdd = 0) => {
      const date = new Date();
      date.setDate(date.getDate() + daysToAdd);
      return date.toISOString().split("T")[0];
    };

   

    // Constructing the JSON request
    const requestPayload = {
      requestorTransactionId: generateTransactionId(),
      debtorName: formData.payerName,
      debtorEmailId: formData.payerEmail,
      // debtorMobileNumber: `+${formData.selectedCountryCode}-${formData.payerMobileNumber}`,
      debtorMobileNumber:formData.payerMobileNumber,
      collectionReferenceNumber: "",
      reasonForCollection: formData.description || "",
      initialDueAmount: parseFloat(formData.paymentAmount),
      initialDueDate: getCurrentDateFormatted(),
      charges: 0,
      reasonForCharges: "",
      finalDueAmount: parseFloat(formData.paymentAmount),
      finalDueDate: getCurrentDateFormatted(),
      collectionAmountCurrency: formData.selectedCurrency,
      additionalComments: "",
      merchantId: merchantId
    };

    try {


      if (!token) {
        alert("Token is missing in the URL.");
        setLoading(false);
        return;
      }

      const res = await PaymentService.processPayload(requestPayload, token);

      if (res?.statusCode === 302 && res?.message) {
        console.log("res.message", res.message);
        setRedirectUrl(res.message);
      } else {

        let errorMessage = "An error occurred while processing the payment request.";
    
        if (res?.message) {
          const errorArray = res.message.match(/\{([^}]+)\}/g);
          if (errorArray) {
            const errorObj = Object.fromEntries(
              errorArray[0]
                .replace(/[{}]/g, "")
                .split(", ")
                .map(pair => pair.split("="))
            );
            errorMessage = errorObj.errorDescription || errorMessage;
          }
        }
    
        toast.error(errorMessage);
      }

    } catch (error) {
      console.error("Error processing payment request:", error);
      setLoading(false);

    }
  };
  

  return (
    <>

     {isLoading && (<div id="semiTransparenDiv"></div>)}

      <Layout
        headerLogo={userInfo.logoUrl}
        bgColor="bg-white"
      >

        <div class="grid grid-cols-2 md:grid-cols-3 gap-1 p-2 font-roboto min-h-[95%]">
          <div className="bg-white item-center justify-center h-auto hidden md:flex">
            <img
              class="h-[30%] max-h-[175px] bg-transparent aspect-auto mr-2"
              src={userInfo.logoUrl}
              alt=""
              style={{ marginTop: '15%' }}
            />
          </div>

          <div className="col-span-2 h-full flex items-center justify-center lg:mr-5">
            <div class="h-full w-full max-w-4xl bg-white border border-gray-200 rounded-lg drop-shadow-xl relative">
              <div className="mx-2 md:mx-10 mt-6 max-h-full">
                <div class=" grid-flow-col gap-1 min-w-full">
                  <div>
                    <p className="text-center text-lg font-bold tracking-tight text-blue-700 mb-3">Make a payment </p>
                  </div>
                </div>
              </div>

              <div class="grid  grid-flow-col">
                <div>
                  <hr className="w-auto" />
                </div>
              </div>

              <div className="mt-5 mx-2 md:mx-10 space-y-3 text-sm md:text-base">
                <div className="text-base grid grid-cols-2 md:grid-cols-2 gap-y-3 gap-x-6">
                  <CustomInputLabel style={{ marginTop: "20px" }} required>Amount</CustomInputLabel>
                  <div className="flex space-x-2 items-center">
                  <select
                    name="selectedCurrency"
                    value={formData.selectedCurrency}
                    onChange={handleChange}
                    className=" h-10 border-b-2  px-3 mt-3 outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">CCY </option>
                    {currencyList.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code}
                      </option>
                    ))}
                  </select>
                  <TextField
                    size="small"
                    type="number"
                    name="paymentAmount"
                    placeholder="Enter the amount"
                    value={formData.paymentAmount}
                    rows={1}
                    onChange={handleChange}
                    onBlur={(e) => updateDecimal(e.target.value, formData.selectedCurrency)}
                    style={{marginTop:"15px"}}
                    className="w-full border-b-2 border-gray-300 rounded-md px-3 mt-8 outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  </div>
                  <CustomInputLabel style={{ marginTop: "5px" }} required>Name</CustomInputLabel>
                  <TextField
                    type="text"
                    name="payerName"
                    placeholder="Please Enter Your Name"
                    value={formData.payerName}
                    onChange={handleChange}
                    className="w-full border px-2 py-1 "
                    size="small"

                  />
                  <CustomInputLabel style={{ marginTop: "5px" }}>Email</CustomInputLabel>
                  <TextField
                    type="email"
                    name="payerEmail"
                    placeholder="Please Enter Your Email"
                    value={formData.payerEmail}
                    onChange={handleChange}
                    onBlur={handleEmail}
                    className="border px-2 py-1 w-full"
                    size="small"

                  />

                  <CustomInputLabel style={{ marginTop: "5px" }}>Phone</CustomInputLabel>
                  <FormControl style={{ minWidth: '60%' }}>
                    <MUIPhoneInput
                      defaultCountry={"in"} 
                      disableAreaCodes={true}
                      value={formData.payerMobileNumber} 
                      onChange={handlePhoneChange} 
                      onBlur={handlePhoneBlur} 
                      inputProps={{
                        name: "payerMobileNumber",
                        required: true,
                      }}
                      size="small"
                      className="w-full border-b-2 border-gray-300 rounded-md px-3 mt-8 outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </FormControl>

                  <CustomInputLabel style={{ marginTop: "5px" }} required>Description</CustomInputLabel>
                  <TextField
                    size="small"
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    className="border px-2 py-1 w-full"

                  />
                </div>

                <div className="grid grid-cols-1" style={{ marginTop: '3%' }}>
                  <div className="mb-8">
                    <button
                      onClick={async () => {
                        setPaymentProcessing(true);
                        setPayBtnText("Please wait...");

                        await handleSubmit(); // Correctly calling handleSubmit

                        setPaymentProcessing(false);
                        setPayBtnText("Pay Now");
                      }}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg mt-3 mb-8 hover:bg-blue-700 transition-all duration-200 ease-in-out flex justify-center items-center"
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
                            strokeWidth="4"
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
      </Layout>
    </>
  );
}
const mapStateToProps = (state) => {
  return {
    device: state.device,
  };
};
export default connect(mapStateToProps)(PaymentRequestInitiate);
