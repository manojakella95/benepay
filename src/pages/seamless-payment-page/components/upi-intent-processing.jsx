import { connect } from "react-redux";
import "../seamless-payment-page.css";
import { useEffect, useState } from "react";
const UpiIntentProcessing = ({
    statusUrl,
}) => {
    const [intentOpened, setIntentOpened] = useState(false);

    useEffect(() => {
        window.addEventListener("focus", handleOnFocus);

        return () => {
            window.removeEventListener("focus", handleOnFocus);
        };
    }, [intentOpened]);

    useEffect(() => {
        window.addEventListener("blur", handleOnBlur);

        return () => {
            window.removeEventListener("blur", handleOnBlur);
        };
    }, [intentOpened]);

    const handleOnBlur = () => {
        setIntentOpened(true);
    }

    const handleOnFocus = () => {
        if (intentOpened) {
            window.location.href = statusUrl;
        }
    }

    return <>
        <div className="fixed top-0 left-0 w-screen h-screen bg-[#1d2630] z-[10000] flex flex-col justify-center items-center text-white">
            <div className="spinner-box">
                <div className="configure-border-1">
                    <div className="configure-core"></div>
                </div>
                <div className="configure-border-2">
                    <div className="configure-core"></div>
                </div>
            </div>
            <div className="flex flex-col justify-center items-center text-center pt-12 leading-tight">
                {/* <h2 className="font-medium text-xl">Processing UPI Payment</h2> */}
                <h3 className="font-normal text-lg">Please Wait...</h3>
                <p className="text-[#C0AF90] text-sm font-normal mt-8">Do not close the browser or press back button</p>
            </div>
            <button onClick={() => { window.location.href = statusUrl; }} className="text-white absolute top-8 left-8 cursor-pointer">
                <svg
                    width="1rem" height="1rem" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#ffffff" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z" />
                    <path fill="#ffffff"
                        d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z" />
                </svg>
            </button>
        </div>
    </>
};

const mapStateToProps = (state) => {
    return {
        device: state.device,
    };
};

export default connect(mapStateToProps)(UpiIntentProcessing);