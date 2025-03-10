import { connect } from "react-redux";
import "../seamless-payment-page.css";
import { useEffect, useState } from "react";
const UPIInfoModel = ({
    type,
    isBtnClicked,
    setIsBtnClicked
}) => {

    useEffect(() => {
        if (isBtnClicked) {
            document.getElementById('my_modal_2').showModal()
        }
    }, [isBtnClicked])

    const [active, setActive] = useState(0);

    const paymentApplications = [
        {
            name: "Google Pay",
            icon: null,
            html: <>
                <ol class="text-lg text-gray-900 list-none list-inside pb-4 mb-2 border-b-[1px] border-gray-500">
                    <li>Step-1: Open the application.</li>
                    <li>Step-2: Go to the top left corner and click on your profile icon.</li>
                    <li>Step-3: Tap on “bank accounts”.</li>
                    <li>Step-4: Select the bank account whose ID you want to check.</li>
                    <li>Step-5: You will find the ID of that bank account.</li>
                </ol>
            </>
        },
        {
            name: "BHIM",
            icon: null,
            html: <>
                <ol class="text-lg text-gray-900 list-none list-inside pb-4 mb-2 border-b-[1px] border-gray-500">
                    <li>Step-1: Open the application.</li>
                    <li>Step-2: Tap on ‘profile’ visible on the homepage.</li>
                    <li>Step-3: You will find the ID in the pattern of your registeredmobilenumber@upi</li>
                </ol>
            </>
        },
        {
            name: "Paytm",
            icon: null,
            html: <>
                <ol class="text-lg text-gray-900 list-none list-inside pb-4 mb-2 border-b-[1px] border-gray-500">
                    <li>Step-1: Login into the Paytm application.</li>
                    <li>Step-2: Go to the topmost part of the homepage and find the “BHIM UPI” section.</li>
                    <li>Step-3: You will find your ID along with a QR code in the pattern phonenumber@paytm.</li>
                </ol>
            </>
        },
        {
            name: "PhonePay",
            icon: null,
            html: <>
                <ol class="text-lg text-gray-900 list-none list-inside pb-4 mb-2 border-b-[1px] border-gray-500">
                    <li>Step-1: Open the application.</li>
                    <li>Step-2: Click on your profile icon at the top left corner of the homepage.</li>
                    <li>Step-3: Select “My BHIM UPI ID” from the next page.</li>
                    <li>Step-4: You will find the ID in the pattern phonenumber@ybl.</li>
                </ol>
            </>
        },
        {
            name: "Mobikwik",
            icon: null,
            html: <>
                <ol class="text-lg text-gray-900 list-none list-inside pb-4 mb-2 border-b-[1px] border-gray-500">
                    <li>Step-1: Open Mobikwik application.</li>
                    <li>Step-2: Find the Id at the top right corner with the pattern yourmobilenumber@ikwik.</li>
                </ol>
            </>
        },
        {
            name: "Amazon Pay",
            icon: null,
            html: <>
                <ol class="text-lg text-gray-900 list-none list-inside pb-4 mb-2 border-b-[1px] border-gray-500">
                    <li>Step-1: Open your Amazon application.</li>
                    <li>Step-2: Tap on three lines at the top left corner.</li>
                    <li>Step-3: Select the Amazon Pay option.</li>
                    <li>Step-4: Click on the Amazon UPI tab.</li>
                    <li>Step-5: Find the ID in the pattern yourmobilenumber@apl.</li>
                </ol>
            </>
        },
        {
            name: "SBI YONO",
            icon: null,
            html: <>
                <ol class="text-lg text-gray-900 list-none list-inside pb-4 mb-2 border-b-[1px] border-gray-500">
                    <li>Step-1: Open your SBI YONO application.</li>
                    <li>Step-2: Select the YONO Pay option.</li>
                    <li>Step-3: Choose the BHIM UPI option.</li>
                    <li>Step-4: Choose the “Generate QR” option.</li>
                    <li>Step-5: Check the ID from the next screen.</li>
                </ol>
            </>
        },
        {
            name: "WhatsApp",
            icon: null,
            html: <>
                <ol class="text-lg text-gray-900 list-none list-inside pb-4 mb-2 border-b-[1px] border-gray-500">
                    <li>Step-1: Open your Whatsapp application.</li>
                    <li>Step-2: Go to the top right corner and click on 3 dots.</li>
                    <li>Step-3: Select the payment option.</li>
                    <li>Step-4: Click on any linked bank account to check for the UPI ID you want.</li>
                    <li>Step-5: Find the ID here.</li>
                </ol>
            </>
        }
    ]

    return <>
        <dialog id="my_modal_2" className="modal">
            <div className="modal-box">
                <div className="overflow-y-auto overflow-x-hidden z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                    <div className="p-4 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-full">
                        <div className="relative bg-white rounded-lg shadow-sm ">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900 ">
                                    {type != null && type == '1' ? "How to pay money using UPI Id" : "How to find UPI ID across Different Payment Applications"}
                                </h3>
                                <form method="dialog" className="modal-backdrop">
                                    <button onClick={() => { setIsBtnClicked(false); }} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                                        <svg onClick={() => { setIsBtnClicked(false); }} className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                        </svg>
                                        <span onClick={() => { setIsBtnClicked(false); }} className="sr-only">Close modal</span>
                                    </button>
                                </form>
                            </div>
                            {type != null && type == '1' ?
                                <div className="p-4 md:p-5 space-y-4 pareny">
                                    <ol class="text-lg text-gray-900 list-decimal list-inside">
                                        <li>Payers enter their UPI Id (also called VPA number) from which they want to make the payment</li>
                                        <li>A notification pops up on their mobile for request money</li>
                                        <li>Payers clicks on the notification and open their banks UPI app where they canreview the payment request</li>
                                        <li>Once they authorise the payment on their app (either by entering UPI PIN/authenticating through other means), transaction is completed</li>
                                        <li>Payers gets successful transaction notification on their app and on BenePay</li>
                                        <li>In addition, an email/sms notification may get sent to payers, if their merchant has enabled the same</li>
                                    </ol>
                                </div>
                                :
                                <div className="p-4 md:p-5 space-y-4 pareny">
                                    <h2 className="text-lg text-gray-900 my-2">
                                        Below are the steps for finding your UPI ID across some key UPI apps. In case your
                                        UPI app is not mentioned, it’s usually found under profile/account(s) in your
                                        application.
                                    </h2>
                                    <div>
                                        {paymentApplications && paymentApplications.length > 0 && paymentApplications.map((data, index) => {
                                            return <>
                                                <div onClick={() => {setActive(index)}} className={`w-full border-b-[1px] border-gray-500 flex justify-between items-center mb-2 cursor-pointer`}>
                                                    <div className="flex justify-start items-center">
                                                        {data.icon != null && <>
                                                            <img key={`nb-logo`} src={data.icon} alt={`Net Banking logo`} className="h-7" />
                                                        </>}
                                                        <h4 className={`text-lg mb-2 ${index == active ? "text-gray-950 font-medium" : "text-gray-800"}`}>
                                                            {data.name}
                                                        </h4>
                                                    </div>
                                                    <div className={`flex justify-end items-center ${index == active ? "text-gray-950 font-medium" : "text-gray-800"}`}>
                                                        <svg className={`w-3 h-3 shrink-0 transition-all ease-in-out duration-75 ${index == active ? "rotate-0" : "rotate-180"}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                                                            <path stroke="currentColor" fill="" opacity={0.8} stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5 5 1 1 5" />
                                                        </svg>
                                                    </div>
                                                </div>
                                                {index == active && data.html != null && data.html}
                                            </>
                                        })}
                                    </div>
                                </div>}
                        </div>
                    </div>
                </div>
            </div>
        </dialog>
    </>
};

const mapStateToProps = (state) => {
    return {
        device: state.device,
    };
};

export default connect(mapStateToProps)(UPIInfoModel);