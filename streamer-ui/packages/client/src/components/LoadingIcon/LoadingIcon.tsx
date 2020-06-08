import React from "react";

import { Icon, Spin } from "antd";

const LoadingIcon: React.FC = () => {
    const antIcon = <Icon type="loading" style={{ fontSize: 24, margin: 10 }} spin />;
    return (
        <Spin indicator={antIcon} />
    );
};

export default LoadingIcon;