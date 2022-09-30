import React from "react";
import { Result, Button } from "antd";

import "../../app/App.less";
import { ResultStatusType } from "antd/lib/result";

const ErrorPage: React.FC<{
    status: ResultStatusType,
    message: string,
    action?: () => void,
}> = ({status, message, action}) => {

    return (
        <div style={{ padding: 10 }}>
            <Result
                status={status}
                title={status}
                subTitle={message}
                extra={<Button href="/" type="primary">Back Home</Button>}/>
        </div>
    );
};

export default ErrorPage;