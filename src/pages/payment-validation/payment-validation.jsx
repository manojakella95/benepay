import { connect } from "react-redux";
import { PaymentService } from "../../service/api/payment.service";
import { baseUrl, urls } from "../../config/urlConfig";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import AppHeader from "../../components/app-frame/app-header/app-header";

const PaymentValidation = (props) => {
  const { device } = props;
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    transactionReference: "",
    amount: "",
    paymentTime: "",
    paymentTime: "",
    customerReference: "",
    beneCollectMessage: "",
    paymentTime: "",
    traceId: "",
    paymentCreationTime: "",
    poweredByBp: "",
  });

  useEffect(() => {
    let queryParams = window.location.search;
    const urlType = (queryParams.includes("traceId") && queryParams.includes("paymentId")) ? 'query' : 'path'
    let beneId,payEngineId; 
    if (urlType == "query") {
      queryParams = (new URL(document.location)).searchParams;
      beneId = queryParams.get("traceId");
      payEngineId = queryParams.get("paymentId");
    } else {
      const url = window.location.href;
      const params = url.split("/")
      beneId = params[4];
      payEngineId = params[5].split('?')[0];
    }
    getPaymentStatus(beneId, payEngineId);
  }, []);

  const getPaymentStatus = async (beneId, payEngineId) => {
    setLoading(true);
    let paymentDetailsResponse = await PaymentService.getPaymentStatus(
      beneId,
      payEngineId
    );
    setLoading(false);
    if (!paymentDetailsResponse) {
      return;
    }
    // const date = new Date(paymentDetailsResponse.paymentTime)
    //   .toString()
    //   .split("GMT")[0];
    // paymentDetailsResponse.paymentTime = date;
    console.log("paymentDetailsResponse ", paymentDetailsResponse);
    setPaymentDetails(paymentDetailsResponse);
    console.log("paymentDetailsResponse ", paymentDetailsResponse);
    console.log("paymentDetailsResponse ", paymentDetailsResponse.benePayStatus);
    console.log("providerPaymentStatus ", paymentDetailsResponse.providerPaymentStatus);

    if (paymentDetailsResponse.providerPaymentStatus === "SUCCESS" && (paymentDetailsResponse.benePayStatus === "PAID"
      || paymentDetailsResponse.benePayStatus === "PARTIALLY_PAID")) {
      navigate("/payment-success", {
        state: {
          payment: paymentDetailsResponse,
        },
      });
      return;
    } else if (paymentDetailsResponse.providerPaymentStatus === "IN_PROCESS") {
      navigate("/payment-pending", {
        state: {
          payment: paymentDetailsResponse,
        },
      });
      return;
    } else {
      navigate("/payment-failed", {
        state: {
          payment: paymentDetailsResponse,
        },
      });

  if (paymentDetailsResponse.benePayStatus ===  "AWAITING_PAYMENT") {
    setTimeout(() => {
      navigate((`/?token=${paymentDetailsResponse.transactionReference}`), {
        state: {
          payment: paymentDetailsResponse 
        }});
    }, 20000);
    return;
   }
}
};

  return (
    // <div className="payment-validation-main">
    //   {device.scale === 1 ||
    //     device.scale === 2 ||
    //     (device.scale === 3 && (
    //       <AppHeader username={paymentDetails.debtorName} />
    //     ))}
    //   {isLoading && (
    //     <div id="semiTransparenDiv">
    //       <div className="w-full h-screen flex justify-center items-center text-white mt-44">
    //         Validating Payment...
    //       </div>
    //     </div>
    //   )}
    // </div>
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
  );
};
const mapStateToProps = (state) => {
  return {
    device: state.device,
  };
};
export default connect(mapStateToProps)(PaymentValidation);
