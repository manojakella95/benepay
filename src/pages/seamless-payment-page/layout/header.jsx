import React from "react";

const Header = (props) => {
    return (
        <div className="sticky top-0 z-50 w-full transition duration-300">
            <header className="bg-white shadow px-6 py-2">
                <nav className="items-center justify-between grid grid-cols-1 md:grid-cols-4 gap-4" aria-label="Global">
                    <div>
                        <a href="#" className="-m-1.5 p-1.5 flex items-center justify-center">
                            <img className="h-16 w-auto" src={props.logo} alt="" />
                        </a>
                    </div>

                    <div className="col-span-2">
                        {props.headerChildren}
                    </div>
                </nav>
            </header>
        </div>


        // <header className="bg-white shadow py-4 px-6">
        //     <div className="flex justify-between items-center">
        //         <img src={props.logo} alt="Logo" className="h-10" />
        //         <div className="flex items-center space-x-4">
        //             <span className="font-semibold">Payment details</span>
        //             <span className="text-gray-500">&gt;</span>
        //             <span className="font-semibold">Review Payment</span>
        //             <span className="text-gray-500">&gt;</span>
        //             <span className="font-semibold">Complete</span>
        //         </div>
        //     </div>
        // </header>
    );
}

export default Header;
