/****************************************************
 MetaMask
 ****************************************************/

exports.sendTransaction = function (netId, dataFrom, from) {
    const id = randomString()+"-MetaMask-sendTransaction";
    sys.logs.info('[metamask] Sending transaction to MetaMask');
    sys.ui.sendMessage({
        scope: 'uiService:metamask.metaMask',
        name: 'processMessage',
        operation:  'sendTransaction',
        idOperation: id,
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
                let response = {
                    id: originalMessage.idOperation,
                    tx: callbackData.data.tx,
                    txHash: callbackData.data.txHash,
                };
                sys.storage.put(response.id, response);
            },
            declined: function (originalMessage, callbackData) {
                sys.logs.warn('[metamask] Send transaction declined. Transaction tx: ' + callbackData.tx);
                sys.events.triggerEvent('metamask:sendTransaction', {
                    tx: callbackData.tx,
                    error: callbackData.error,
                    originalMessage: originalMessage
                });
                let response = {
                    id: originalMessage.idOperation,
                    tx: callbackData.data.tx,
                    error: callbackData.data.error,
                };
                sys.storage.put(response.id, response);
            },
            error: function (originalMessage, callbackData) {
                sys.logs.error('[metamask] Fail callback with message: ['+callbackData.error+'] and code: ['+callbackData.errorCode + ']');
                sys.logs.error('[metamask] Additional Info: ['+JSON.stringify(originalMessage)+'] tx: ['+callbackData.tx + ']');
                throw new Error(callbackData);
            }
        }
    });
    return id;
}

exports.signData = function () {
    const id = randomString()+"-MetaMask-signData";
    sys.logs.info('[metamask] Signing data with MetaMask');
    sys.ui.sendMessage({
        scope: 'uiService:metamask.metaMask',
        name: 'processMessage',
        operation:  'signData',
        idOperation: id,
        callbacks: {
            approved: function (originalMessage, callbackData) {
                sys.logs.info('[metamask] Sign data approved. Data: ' + callbackData.data);
                sys.events.triggerEvent('metamask:signData', {
                    data: callbackData.data,
                    signedData: callbackData.signedData,
                    originalMessage: originalMessage
                });
                let response = {
                    id: originalMessage.idOperation,
                    data: callbackData.data,
                    signedData: callbackData.data.signedData,
                };
                sys.storage.put(response.id, response);
            },
            declined: function (originalMessage, callbackData) {
                sys.logs.warn('[metamask] Sign data declined. Transaction tx: ' + callbackData.tx);
                sys.events.triggerEvent('metamask:signData', {
                    tx: callbackData.tx,
                    error: callbackData.error,
                    originalMessage: originalMessage
                });
                let response = {
                    id: originalMessage.idOperation,
                    tx: callbackData.data.tx,
                    error: callbackData.data.error,
                };
                sys.storage.put(response.id, response);
            },
            error: function (originalMessage, callbackData) {
                sys.logs.error('[metamask] Fail callback with message: ['+callbackData.error+'] and code: ['+callbackData.errorCode + ']');
                sys.logs.error('[metamask] Additional Info: ['+JSON.stringify(originalMessage)+'] tx: ['+callbackData.tx + ']');
                throw new Error(callbackData);
            }
        }
    });
    return id;
}

exports.getConfigMetamask = function () {
    const id = randomString()+"-MetaMask-getConfigMetamask";
    sys.logs.info('[metamask] Requesting config from MetaMask');
    sys.ui.sendMessage({
        scope: 'uiService:metamask.metaMask',
        name: 'processMessage',
        operation: 'getConfigMetamask',
        idOperation: id,
        callbacks: {
            response: function (originalMessage, callbackData) {
                sys.logs.info('[metamask] Get config from MetaMask: [' + JSON.stringify(callbackData) + ']');
                let response = {
                    id: originalMessage.idOperation,
                    netId: callbackData.data.netId,
                    defaultAccount: callbackData.data.defaultAccount,
                    accounts: callbackData.data.accounts
                };
                sys.storage.put(response.id, response, {ttl: 60 * 60 * 1000});
            }
        }
    });
    return id;
}

/****************************************************
 Private API
 ****************************************************/

function randomString(length) {
    length = length || 10;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
