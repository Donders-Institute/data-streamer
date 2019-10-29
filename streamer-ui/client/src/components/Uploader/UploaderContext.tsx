import React from "react";

export interface IUploaderContext {
    test: string;
}

const UploaderContext = React.createContext<IUploaderContext | null>(null);

const UploaderProvider = UploaderContext.Provider;

const UploaderConsumer = UploaderContext.Consumer;

export { UploaderContext, UploaderProvider, UploaderConsumer };
