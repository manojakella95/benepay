import { useRoutes } from "react-router-dom";
import PaymentDetails from "./pages/payment-details/payment-details";
import PaymentSuccess from "./pages/payment-success/payment-success-v2";
import PaymentFailed from "./pages/payment-failed/payment-failed-v2";
import PaymentAlreadyPaid from "./pages/payment-already-paid/payment-already-paid-v2";
import PaymentRefundIssued from "./pages/payment-refund-issued/payment-refund-issued";
import RefundIssued from "./pages/payment-refund-issued/payment-refund-issued-v2";
import PaymentExpired from "./pages/payment-expired/payment-expired-v2";
import PaymentCancelled from "./pages/payment-cancelled/payment-cancelled-v2";
import PaymentValidation from "./pages/payment-validation/payment-validation";
import AppMaintenance from "./pages/app-maintenance/app-maintenance";
import PayNowFromWebsite from "./pages/pay-now-from-website/pay-now-from-website";
import PaymentInvalid from "./pages/payment-invalid/payment-invalid";
import PaymentInitiate from "./pages/payment-details/payment-initiate";
import PartialPayment from "./pages/partial-payments";
// import PaymentPending from "./pages/payment-pending/payment-pending";
import PaymentPending from "./pages/payment-pending/payment-pending-v2";
import NTTPaymentInitiate from "./pages/NTT/initiate-payment";
import SeamlessPaymentPage from "./pages/seamless-payment-page/seamless-payment-page";
import SeamlessInitPaymentPage from "./pages/seamless-payment-page/payment-details";
import CommonPaymentJourney from "./pages/common-payment-journey/common-payment-journey";
import PaymentRequestInitiate from "./pages/payment-request-initiate/payment-request-initiate";

const AppRouter = () => {
  const routes = useRoutes([
    // {
    //   path: "/",
    //   element: <PaymentDetails />,
    // },
    // {
    //   path: "/:token",
    //   element: <PaymentDetails />,
    // },
    {
      path: "/seamlessPayment",
      element: <SeamlessInitPaymentPage />,
    },
    {
      path: "/payment-initiate",
      element: <PaymentInitiate/>,
    },
    {
      path: "/payment-success",
      element: <PaymentSuccess/>,
    },
    {
      path: "/payment-failed",
      element: <PaymentFailed/>,
    },
    {
      path: "/status",
      element: <PaymentValidation/>,
    },
    {
      path: "/error",
      element: <PaymentValidation/>,
    },
    {
      path: "/status/:beneId/:traceId",
      element: <PaymentValidation/>,
    },
    {
      path: "/payment-cancelled",
      element: <PaymentCancelled/>,
    },
    {
      path: "/payment-expired",
      element: <PaymentExpired/>,
    },
    {
      path: "/payment-already-paid",
      element: <PaymentAlreadyPaid/>,
    },
    {
      path: "/refund-issued",
      element: <RefundIssued/>,
    },
    {
      path: "/maintenance",
      element: <AppMaintenance/>,
    },
    {
      path: "/paynowfromwebsite",
      element: <PayNowFromWebsite/>,
    },
    {
      path: "/invalid-payment",
      element: <PaymentInvalid />,
    },
    {
      path: "/partial-payment",
      element: <PartialPayment />,
    },
    {
      path: "/payment-pending",
      element: <PaymentPending/>,
    },
    {
      path: "/payment-in-process",
      element: <PaymentPending/>
    },
    {
      path: "/initiate-ntt-payment",
      element: <NTTPaymentInitiate/>,
    },
    {
      path: "/",
      element: <CommonPaymentJourney />,
    },
    {
      path: "/seamless-payments-page",
      element: <SeamlessPaymentPage />,
    },
    {
      path: "/payment-request-initiate/:merchantId",
      element: <PaymentRequestInitiate />,
    }
  ]);
  return routes;
};

export default AppRouter;
