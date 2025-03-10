import axios from 'axios';
import {baseUrl} from "../../config/urlConfig";
import {toast} from 'react-toastify'

export const HTTP = axios.create({
    baseURL: baseUrl,
    headers: { 'Content-Type': 'application/json' }
});

HTTP.interceptors.response.use(undefined, (error) => {
    console.log("error ", error);

    if (error.response && error.response.data && error.response.data.location) {
        console.log("inside error response")
        window.location = error.response.data.location
      }
    
      var status  = 200;
      
      if( error.response && error.response.status ){
        status = error.response.status;
      }

      console.log('status ', status);

      if (status === 401) {
        window.location.href = "/maintenance?title=Session Expired&message=Your session has expired, please try again.";
        return;
      }
      
      if (status === 502 || status === 503 || status === 500) {
          window.location.href = "/maintenance";
          return;
      }

        if (error.message === 'Network Error' && !error.response) {
            return toast.error('');
        }


        if (status === 404) {
            return toast.error('404 Not Found!');
        }

        if (status === 500) {
            return toast.error('Internal Server Error, please try again later in some time');
        }
        else {
            if (error.message === 'Network Error') {
                return toast.error('Network Error');
            }
        }
    }
);

// HTTP.interceptors.request.use(request => {
//     // request.headers['x-access-token'] = "abcd"
// // x-access-token
//     return request;
//  });