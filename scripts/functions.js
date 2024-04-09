/****************************************************
 MetaMask
 ****************************************************/

exports.sendTransaction = function (netId, dataFrom, from, callback) {
    let response = {};
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
                callback(response);
            },
            declined: function (originalMessage, callbackData) {
                sys.logs.warn('[metamask] Send transaction declined. Transaction tx: ' + callbackData.tx);
                sys.events.triggerEvent('metamask:sendTransaction', {
                    tx: callbackData.tx,
                    error: callbackData.error,
                    originalMessage: originalMessage
                });
                response = {
                    tx: callbackData.tx,
                    error: callbackData.error,
                };
                callback(response);
            },
            error: function (originalMessage, callbackData) {
                sys.logs.error('[metamask] Fail callback with message: ['+callbackData.error+'] and code: ['+callbackData.errorCode + ']');
                sys.logs.error('[metamask] Additional Info: ['+JSON.stringify(originalMessage)+'] tx: ['+callbackData.tx + ']');
                throw new Error(callbackData);
            }
        }
    });
}

exports.signData = function (callback) {
    let response = {};
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
                callback(response);
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
                callback(response);
            },
            error: function (originalMessage, callbackData) {
                sys.logs.error('[metamask] Fail callback with message: ['+callbackData.error+'] and code: ['+callbackData.errorCode + ']');
                sys.logs.error('[metamask] Additional Info: ['+JSON.stringify(originalMessage)+'] tx: ['+callbackData.tx + ']');
                throw new Error(callbackData);
            }
        }
    });
}

exports.getConfigMetamask = function (callback) {
    let response = {};
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
                callback(response);
            }
        }
    });
}
