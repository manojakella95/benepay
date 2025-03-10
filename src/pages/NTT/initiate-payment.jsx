import React, { Component } from 'react';

import "../payment-details/payment-initiate.css";
import loadingGif from "../payment-details/asset/loading.gif";
import { PaymentService } from '../../service/api/payment.service';


export default class NTTPaymentInitiate extends Component {

    constructor(props) {
        super(props);

        // Set initial state
        this.state = {
            "encData": "",
            "merchId": "",
            "paymentUrl": ""
        };
    }

    componentDidMount = async () => {
        try {

            let search = window.location.search;
            let params = new URLSearchParams(search);
            let encData = params.get("encData");
            let merchId = params.get("merchId");


            const response = await PaymentService.fetchPaymentUrl();
            
            const paymentUrl = response.data.paymentUrl; 

            this.setState({ encData, merchId, paymentUrl }, () => {
                // Callback after state has been set
                if (this.state.merchId && this.state.encData) {
                    document.forms[0].submit();
                }
            });
        } catch (error) {
            console.error("Error fetching payment URL:", error);
        }
    }


    render() {
        const { encData, merchId, paymentUrl } = this.state;
        
        return (

            <div className="App">
                <form method="POST" action={paymentUrl}>
                    <input type="hidden" name="encData" value={encData} />
                    <input type="hidden" name="merchId" value={merchId} />
                </form>

                <table className="main-table" width="100%" border="0" cellPadding="0" cellSpacing="1">
                    <tbody>
                        <tr>
                            <td align="center">
                                <table width="80%" border="0" cellPadding="1" cellSpacing="0">
                                    <tbody>
                                        <tr>
                                            <td align="center" valign="top" width="100%">
                                                <img alt="" src={loadingGif} width="100" height="100" />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" valign="middle">
                                                <span className="bodytxt4">
                                                    Processing...
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className="main-table" width="100%" border="0" cellPadding="0" cellSpacing="1">
                    <tbody>
                        <tr>
                            <td align="center" valign="top">
                                <span className="bodytxt2" >
                                    You will be redirected to your merchant's website. It might take a few seconds.
                                </span>
                            </td>
                        </tr>
                        <tr>
                            <td align="center" valign="top">
                                <span className="bodytxt2" >
                                    Please do not refresh the page or click the "Back" or "Close" button of your browser.
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div >
        );
    }
}