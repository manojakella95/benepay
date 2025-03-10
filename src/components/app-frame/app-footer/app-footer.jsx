import React from "react";

const AppFooter = () => {
  return (
    <div className="flex items-center justify-center py-4 w-full bg-gray-100">
      <span className="text-sm text-gray-600">
        Copyright © {new Date().getFullYear()} BenePay Ltd. All Rights Reserved
      </span>
    </div>
  );
};

export default AppFooter;
