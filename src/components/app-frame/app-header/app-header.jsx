import React from "react";

const AppHeader = (props) => {
  const { username } = props;
  return (
    <nav className="bg-purple-800 dark:bg-purple-800 border-gray-200">
      <div className="flex items-center py-4 w-60 mx-auto">
        <a href="#" className="flex items-center text-white flex-1">
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Benepay
          </span>
        </a>
        <div className="md:block w-auto" id="navbar-default">
          <h5 className="text-white">{username ? username : 'Guest'}</h5>
        </div>
      </div>
    </nav>
  );
};

export default AppHeader;
