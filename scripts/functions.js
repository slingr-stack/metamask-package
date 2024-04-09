/****************************************************
 MetaMask
 ****************************************************/

exports.sendTransaction = function (netId, dataFrom, from) {
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
                return {
                    tx: callbackData.tx,
                    txHash: callbackData.txHash,
                };
            },
            declined: function (originalMessage, callbackData) {
                sys.logs.warn('[metamask] Send transaction declined. Transaction tx: ' + callbackData.tx);
                sys.events.triggerEvent('metamask:sendTransaction', {
                    tx: callbackData.tx,
                    error: callbackData.error,
                    originalMessage: originalMessage
                });
                return {
                    tx: callbackData.tx,
                    error: callbackData.error,
                };
            },
            error: function (originalMessage, callbackData) {
                sys.logs.error('[metamask] Fail callback with message: ['+callbackData.error+'] and code: ['+callbackData.errorCode + ']');
                sys.logs.error('[metamask] Additional Info: ['+JSON.stringify(originalMessage)+'] tx: ['+callbackData.tx + ']');
                throw new Error(callbackData);
            }
        }
    });
}

exports.signData = function () {
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
                return {
                    data: callbackData.data,
                    signedData: callbackData.signedData,
                };
            },
            declined: function (originalMessage, callbackData) {
                sys.logs.warn('[metamask] Sign data declined. Transaction tx: ' + callbackData.tx);
                sys.events.triggerEvent('metamask:signData', {
                    tx: callbackData.tx,
                    error: callbackData.error,
                    originalMessage: originalMessage
                });
                return {
                    tx: callbackData.tx,
                    error: callbackData.error,
                };
            },
            error: function (originalMessage, callbackData) {
                sys.logs.error('[metamask] Fail callback with message: ['+callbackData.error+'] and code: ['+callbackData.errorCode + ']');
                sys.logs.error('[metamask] Additional Info: ['+JSON.stringify(originalMessage)+'] tx: ['+callbackData.tx + ']');
                throw new Error(callbackData);
            }
        }
    });
}

exports.getConfigMetamask = function () {
    sys.logs.info('[metamask] Requesting config from MetaMask');
    sys.ui.sendMessage({
        scope: 'uiService:metamask.metaMask',
        name: 'processMessage',
        operation: 'getConfigMetamask',
        callbacks: {
            response: function (originalMessage, callbackData) {
                sys.logs.info('[metamask] Get config from MetaMask: [' + JSON.stringify(callbackData) + ']');
                return {
                    netId: callbackData.netId,
                    defaultAccount: callbackData.defaultAccount,
                    accounts: callbackData.accounts
                };
            }
        }
    });
}