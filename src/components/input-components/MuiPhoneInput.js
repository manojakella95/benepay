import React, { useState } from "react";
// import MuiPhoneNumber from "material-ui-phone-number";
import MuiPhoneNumber from 'mui-phone-number';
import _ from "lodash";


export default function MUIPhoneInput(props) {
    const [errors, setErrors] = useState([]);
    const { rules } = props;

    return (
        <>
            <MuiPhoneNumber
                {...props}
                variant= {props.localVariant ? props.localVariant : "outlined"}
                InputProps={{
                    disableUnderline: props.localUnderline == false ? props.localUnderline : true 
                  }}
                size="small"
                onChange={async (e, v) => {
                    setErrors([]);

                    if (typeof props.onChange == "function") {
                        await props.onChange(e, v);
                    }
                }}
                onBlur={async (e) => {
                    e.persist();

                    if (typeof props.onBlur == "function") {
                        await props.onBlur(e);
                    }
                }}
            />
            
            {!_.isEmpty(errors) && <ul className={'error-msg'} style={{ listStyle: "none", padding: 0 }}>
                {errors.map((e, index) => <li className="error text-danger" key={index}>* {e}</li>)}
            </ul>}

            {(_.isEmpty(errors) && !_.isEmpty(props.errors)) && <ul className={'error-msg'} style={{ listStyle: "none", padding: 0 }}>
                {props.errors.map((e, index) => <li className="error text-danger" key={index}>* {e}</li>)}
            </ul>}
        </>
    );
}