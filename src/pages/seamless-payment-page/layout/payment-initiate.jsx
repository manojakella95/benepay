import React from 'react';

import "./payment-initiate.css";
import loadingGif from "./asset/loading.gif";
import {PaymentService} from "../../../service/api/payment.service";

export default class PaymentInitiate extends React.Component {

  constructor(props) {
    super(props);

    this.state = {}
  }

  render() {
    return (
      <div className="App">
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