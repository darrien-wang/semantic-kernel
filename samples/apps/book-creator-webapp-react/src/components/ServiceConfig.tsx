// Copyright (c) Microsoft. All rights reserved.

import { Body1, Button, Input, Label, Spinner, Tab, TabList, Title3 } from '@fluentui/react-components';
import { FC, useEffect, useState } from 'react';
import { useSemanticKernel } from '../hooks/useSemanticKernel';
import { IKeyConfig } from '../model/KeyConfig';

interface IData {
    uri: string;
    onConfigComplete: (keyConfig: IKeyConfig) => void;
}

const ServiceConfig: FC<IData> = ({ uri, onConfigComplete }) => {
    const [isOpenAI, setIsOpenAI] = useState<boolean>(true);
    const [keyConfig, setKeyConfig] = useState<IKeyConfig>({} as IKeyConfig);
    const [isBusy, setIsBusy] = useState<boolean>(false);
    const sk = useSemanticKernel(process.env.REACT_APP_FUNCTION_URI as string);

    const [OpenAIKey, setOpenAIKey] = useState<string>(process.env.REACT_APP_OPEN_AI_KEY as string);
    const [OpenAIModel, setOpenAIModel] = useState<string>(process.env.REACT_APP_OPEN_AI_MODEL as string);
    const [azureOpenAIKey, setAzureOpenAIKey] = useState<string>(process.env.REACT_APP_AZURE_OPEN_AI_KEY as string);
    const [azureOpenAIDeployment, setAzureOpenAIDeployment] = useState<string>(
        process.env.REACT_APP_AZURE_OPEN_AI_DEPLOYMENT as string,
    );
    const [azureOpenAIEndpoint, setAzureOpenAIEndpoint] = useState<string>(
        process.env.REACT_APP_AZURE_OPEN_AI_ENDPOINT as string,
    );

    const saveKey = async () => {
        setIsBusy(true);

        //POST a simple ask to validate the key
        const ask = { value: 'clippy', inputs: [{ key: 'style', value: 'Bill & Ted' }] };

        try {
            var result = await sk.invokeAsync(keyConfig, ask, 'funskill', 'joke');
            console.log('result', result);
            onConfigComplete(keyConfig);
        } catch (e) {
            alert('Something went wrong.\n\nDetails:\n' + e);
        }

        setIsBusy(false);
    };

    useEffect(() => {
        setKeyConfig((prevState) => ({
            ...prevState,
            completionConfig: {
                key: isOpenAI ? OpenAIKey : azureOpenAIKey,
                deploymentOrModelId: isOpenAI ? OpenAIModel : azureOpenAIDeployment,
                label: isOpenAI ? OpenAIModel : azureOpenAIDeployment,
                endpoint: isOpenAI ? '' : azureOpenAIEndpoint,
                backend: isOpenAI ? 1 : 0,
            },
        }));
    }, [isOpenAI, OpenAIKey, OpenAIModel, azureOpenAIKey, azureOpenAIDeployment, azureOpenAIEndpoint]);

    return (
        <>
            <Title3>Enter in your OpenAI or Azure OpenAI Service Key</Title3>
            <Body1>
                Start by entering in your OpenAI key, either from{' '}
                <a href="https://beta.openai.com/account/api-keys" target="_blank" rel="noreferrer">
                    OpenAI
                </a>{' '}
                or{' '}
                <a href="https://oai.azure.com/portal" target="_blank" rel="noreferrer">
                    Azure OpenAI Service
                </a>
            </Body1>

            <TabList defaultSelectedValue="oai" onTabSelect={(t, v) => setIsOpenAI(v.value === 'oai')}>
                <Tab value="oai">OpenAI</Tab>
                <Tab value="aoai">Azure OpenAI</Tab>
            </TabList>

            {isOpenAI ? (
                <>
                    <Label htmlFor="openaikey">OpenAI Key</Label>
                    <Input
                        id="openaikey"
                        type="password"
                        value={OpenAIKey}
                        onChange={(e, d) => {
                            setOpenAIKey(d.value);
                            setKeyConfig({
                                ...keyConfig,
                                completionConfig: { ...keyConfig.completionConfig, key: d.value },
                            });
                        }}
                        placeholder="Enter your OpenAI key here"
                    />
                    <Label htmlFor="oaimodel">Model</Label>
                    <Input
                        id="oaimodel"
                        value={OpenAIModel}
                        onChange={(e, d) => {
                            setOpenAIModel(d.value);
                            setKeyConfig({
                                ...keyConfig,
                                completionConfig: {
                                    ...keyConfig.completionConfig,
                                    deploymentOrModelId: d.value,
                                    label: d.value,
                                },
                            });
                        }}
                        placeholder="Enter the model id here, ie: text-davinci-003"
                    />
                </>
            ) : (
                <>
                    <Label htmlFor="azureopenaikey">Azure OpenAI Key</Label>
                    <Input
                        id="azureopenaikey"
                        type="password"
                        value={azureOpenAIKey}
                        onChange={(e, d) => {
                            setAzureOpenAIKey(d.value);
                            setKeyConfig({
                                ...keyConfig,
                                completionConfig: { ...keyConfig.completionConfig, key: d.value },
                            });
                        }}
                        placeholder="Enter your Azure OpenAI key here"
                    />
                    <Label htmlFor="oaimodel">Model</Label>
                    <Input
                        id="aoaideployment"
                        value={azureOpenAIDeployment}
                        onChange={(e, d) => {
                            setAzureOpenAIDeployment(d.value);
                            setKeyConfig({
                                ...keyConfig,
                                completionConfig: {
                                    ...keyConfig.completionConfig,
                                    deploymentOrModelId: d.value,
                                    label: d.value,
                                },
                            });
                        }}
                        placeholder="Enter your deployment id here, ie: my-deployment"
                    />
                    <Label htmlFor="oaiendpoint">Endpoint</Label>
                    <Input
                        id="aoaiendpoint"
                        value={azureOpenAIEndpoint}
                        onChange={(e, d) => {
                            setAzureOpenAIEndpoint(d.value);
                            setKeyConfig({
                                ...keyConfig,
                                completionConfig: { ...keyConfig.completionConfig, endpoint: d.value },
                            });
                        }}
                        placeholder="Enter the endpoint here, ie: https://my-resource.openai.azure.com"
                    />
                </>
            )}

            <Button style={{ width: 70, height: 32 }} disabled={isBusy} appearance="primary" onClick={saveKey}>
                Save
            </Button>
            {isBusy ? <Spinner /> : null}
        </>
    );
};

export default ServiceConfig;
