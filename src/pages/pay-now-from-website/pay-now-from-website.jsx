import React, { useState } from "react";
import AppHeader from "../../components/app-frame/app-header/app-header";
import { baseUiUrl } from "../../config/urlConfig";
import { PaymentService } from "../../service/api/payment.service";

function PayNowFromWebsite() {

  const [token, setToken] = useState("");
  const [isLoading, setLoading] = useState(false);

  const redirectToPayment = async () => {

    setLoading(true);
    let paymentId = await PaymentService.getTokenById(token.replaceAll('/', '`!'));
    // console.log("IN", paymentId);
    setLoading(false);

    if (!paymentId || (paymentId && paymentId["Error Code"] && paymentId["Error Code"] === "404:NOT_FOUND")) {
      let url = baseUiUrl + "/invalid-payment";
      window.open(url, "_self");
      return;
    }

    let url = baseUiUrl + '/?token=' + paymentId;
    console.log("URL", url);
    window.open(url, "_self");

  }

  return (
    <div className="">

      {isLoading && (<div id="semiTransparenDiv"></div>)}
      <AppHeader />



      {(window.innerWidth >= 600) ? (
        <div>
          <div className="desktop payment-details-main mt-10 flex flex-col">
            <div className="payment-details-header flex w-full">
              <div className="merchant-logo flex items-center flex-1 pt-4">
                <strong className="md:text-3xl text-xl text-green-600 font-bold ml-3">
                  Make Payments Quickly
                </strong>
              </div>
              <div className="pb-benepay-text flex items-center">
                <p className="pt-5">
                  Powered by
                  <br />
                  <span className="text-xl">BenePay</span>
                </p>
              </div>
            </div>
            <div className="seprator h-1 bg-purple-800 mt-3"></div>
          </div>
          <div className="desktop payment-details-main mt-10 flex flex-col w-10" style={{ marginTop: '5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
              <label htmlFor="token" className="text-xl" style={{ marginRight: '36px', marginLeft: '15px' }}>Payment Reference</label>
              <input id="token" type="text" className="text-xl py-1 px-2" value={token} onChange={e => setToken(e.target.value)} style={{ width: '73%', borderBottom: '1px solid black', outline: 'none' }} placeholder="Enter payment reference" required />
            </div>
            <div className="trasaction-actions flex justify-content-right my-12" >
              <div className="pay-with-card " style={{ width: '100%', display: 'flex', justifyContent: 'right', marginRight: '90px' }}>
                <button className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-20 px-8" style={{ width: 'fit-content' }} onClick={redirectToPayment}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="desktop payment-details-main mt-10 flex flex-col" style={{width: '90%'}}>
            <div className="payment-details-header flex w-full">
              <div className="merchant-logo flex items-center flex-1 pt-4">
                <strong className="md:text-3xl text-xl text-green-600 font-bold ">
                  Make Payments Quickly
                </strong>
              </div>
              <div className="pb-benepay-text flex items-center">
                <p className="pt-5">
                  Powered by
                  <br />
                  <span className="text-xl">BenePay</span>
                </p>
              </div>
            </div>
            <div className="seprator h-1 bg-purple-800 mt-3"></div>
          </div>
          <div className="desktop payment-details-main mt-10 flex flex-col" style={{ width: '90%', marginTop: '4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'start' }}>
              <label htmlFor="token" className="text-xl mb-2" style={{ marginRight: '20px' }}>Payment Reference</label>
              <input id="token" type="text" className="text-xl py-1" value={token} onChange={e => setToken(e.target.value)} style={{ width: '100%', borderBottom: '1px solid black', outline: 'none' }} placeholder="Enter payment reference" required />
            </div>
            <div className="trasaction-actions flex justify-content-right my-12" >
              <div className="pay-with-card " style={{ width: '100%', display: 'flex', justifyContent: 'left' }}>
                <button className="bg-purple-800 hover:bg-purple-700 text-white font-bold py-2 rounded-full md:px-20 px-8" style={{ width: 'fit-content' }} onClick={redirectToPayment}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PayNowFromWebsite;