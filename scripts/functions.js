/****************************************************
 MetaMask
 ****************************************************/

exports.sendTransaction = function (netId, dataFrom, from) {
    let response = {id: uuid()+"MetaMask-sendTransaction"};
    sys.logs.info('[metamask] Sending transaction to MetaMask');
    sys.ui.sendMessage({
        scope: 'uiService:metamask.metaMask',
        name: 'processMessage',
        operation:  'sendTransaction',
        netId: netId,
        data: {
            from: dataFrom
        },
        from: from,
        callbacks: {
            approved: function (originalMessage, callbackData) {
                sys.logs.info('[metamask] Send transaction approved. Transaction hash: ' + callbackData.txHash);
                sys.events.triggerEvent('metamask:sendTransaction', {
                    tx: callbackData.tx,
                    txHash: callbackData.txHash,
                    originalMessage: originalMessage
                });
                response = {
                    tx: callbackData.tx,
                    txHash: callbackData.txHash,
                };
                sys.storage.put(response.id +'MetaMask-sendTransaction', response);
            },
            declined: function (originalMessage, callbackData) {
                sys.logs.warn('[metamask] Send transaction declined. Transaction tx: ' + callbackData.tx);
                sys.events.triggerEvent('metamask:sendTransaction', {
                    tx: callbackData.tx,
                    error: callbackData.error,
                    originalMessage: originalMessage
                });
                response.response = {
                    tx: callbackData.tx,
                    error: callbackData.error,
                };
                sys.storage.put(response.id +'MetaMask-sendTransaction', response);
            },
            error: function (originalMessage, callbackData) {
                sys.logs.error('[metamask] Fail callback with message: ['+callbackData.error+'] and code: ['+callbackData.errorCode + ']');
                sys.logs.error('[metamask] Additional Info: ['+JSON.stringify(originalMessage)+'] tx: ['+callbackData.tx + ']');
                throw new Error(callbackData);
            }
        }
    });
    return response;
}

exports.signData = function () {
    let response = {id: uuid()+"MetaMask-signData"};
    sys.logs.info('[metamask] Signing data with MetaMask');
    sys.ui.sendMessage({
        scope: 'uiService:metamask.metaMask',
        name: 'processMessage',
        operation:  'signData',
        callbacks: {
            approved: function (originalMessage, callbackData) {
                sys.logs.info('[metamask] Sign data approved. Data: ' + callbackData.data);
                sys.events.triggerEvent('metamask:signData', {
                    data: callbackData.data,
                    signedData: callbackData.signedData,
                    originalMessage: originalMessage
                });
                response = {
                    data: callbackData.data,
                    signedData: callbackData.signedData,
                };
                sys.storage.put(response.id +'MetaMask-signData', response);
            },
            declined: function (originalMessage, callbackData) {
                sys.logs.warn('[metamask] Sign data declined. Transaction tx: ' + callbackData.tx);
                sys.events.triggerEvent('metamask:signData', {
                    tx: callbackData.tx,
                    error: callbackData.error,
                    originalMessage: originalMessage
                });
                response = {
                    tx: callbackData.tx,
                    error: callbackData.error,
                };
                sys.storage.put(response.id +'MetaMask-signData', response);
            },
            error: function (originalMessage, callbackData) {
                sys.logs.error('[metamask] Fail callback with message: ['+callbackData.error+'] and code: ['+callbackData.errorCode + ']');
                sys.logs.error('[metamask] Additional Info: ['+JSON.stringify(originalMessage)+'] tx: ['+callbackData.tx + ']');
                throw new Error(callbackData);
            }
        }
    });
    return response;
}

exports.getConfigMetamask = function () {
    let response = {id: uuid()+"MetaMask-getConfigMetamask"};
    sys.logs.info('[metamask] Requesting config from MetaMask');
    sys.ui.sendMessage({
        scope: 'uiService:metamask.metaMask',
        name: 'processMessage',
        operation: 'getConfigMetamask',
        callbacks: {
            response: function (originalMessage, callbackData) {
                sys.logs.info('[metamask] Get config from MetaMask: [' + JSON.stringify(callbackData) + ']');
                response = {
                    netId: callbackData.netId,
                    defaultAccount: callbackData.defaultAccount,
                    accounts: callbackData.accounts
                };
                sys.storage.put(response.id +'MetaMask-getConfigMetamask', response, {ttl: 60 * 60 * 1000});
            }
        }
    });
    return response;
}

/****************************************************
 Private API
 ****************************************************/

function uuid() {
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
