if (window.ethereum) {
    console.log('[metamask] MetaMask is installed!');
    service.provider = window.ethereum;
} else {
    throw ('Non-Ethereum browser detected. Install MetaMask 4.16.0+.');
}

service.pendingMessages = [];
service.pendingNotifications = [];
service.resources = {
    'en': {
        "permissionsDenied": "Access Denied!",
        "permissionsDeniedMessage": "Please check <b>Privacy Mode</b> in Metamask > Settings > Security & Privacy",
        "noAccountsMessage": "You have pending requests for Metamask, click in button below when you log in",
        "noAccountsButton": "Ready",
        "noAccountsTitle": "Pending requests",
        "wrongNetworkTitle": "Wrong network",
        "wrongNetworkMessage": "The app is trying to make the operation in a different Ethereum network than the one selected in MetaMask. Please change it.",
        "wrongAccountTitle": "Wrong account",
        "wrongAccountMessage": "The app is trying to make the operation using an Ethereum address [__address__] that is not the one selected in MetaMask. Please switch to the correct account in MetaMask."
    },
    'es': {
        "permissionsDenied": "Acceso Denegado!",
        "permissionsDeniedMessage": "Por favor, verifique el <b>Privacy Mode</b> en Metamask > Settings > Security & Privacy",
        "noAccountsMessage": "Tiene solicitudes pendientes para Metamask, haga click en el botón de abajo cuando haya iniciado sesión",
        "noAccountsButton": "Listo",
        "noAccountsTitle": "Solicitudes pendientes",
        "wrongNetworkTitle": "Red inválida",
        "wrongNetworkMessage": "La aplicación está intentando realizar la operación en una red de Ethereum que no coincide con la seleccionada en MetaMask. Por favor cámbiela.",
        "wrongAccountTitle": "Cuenta inválida",
        "wrongAccountMessage": "La aplicación está intentando realizar la operación con una dirección de Ethereum [__address__] que no es la seleccionada en MetaMask. Por favor verifique su configuración."
    }
};

service.processMessage = async function (message) {
    let notificationMessage;
    let notificationContent;
    let notificationSettings;
    try {
        console.log('[metamask] Processing metamask event. Requesting accounts...');
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        if (!accounts || !accounts.length) {
            processPendingMessages = function () {
                for (let i in service.pendingNotifications) {
                    service.pendingNotifications[i].close();
                }
                let allSuccess = true;
                for (let k in service.pendingMessages) {
                    if (!service.processMessage(service.pendingMessages[k])) {
                        allSuccess = false;
                    }
                }
                if (allSuccess) {
                    service.pendingMessages = [];
                }
            };
            service.pendingMessages.push(message);
            if (service.pendingMessages.length === 1) {
                notificationMessage = '<div>'
                    + '  <label class="label">' + sys.i18n.t('UI services:' + service.name + '.noAccountsMessage') + '</label>'
                    + '  <hr/>'
                    + '  <div class="restart-button">'
                    + '      <a style="padding-left: 2%; color: white;" icon="zmdi-play" onClick="processPendingMessages()">'
                    + '          <i class="zmdi zmdi-play"></i>'
                    + '          <span>' + sys.i18n.t('UI services:' + service.name + '.noAccountsButton') + '</span>'
                    + '      </a>'
                    + '  </div>'
                    + '</div>';

                notificationContent = {
                    title: sys.i18n.t('UI services:' + service.name + '.noAccountsTitle'),
                    message: notificationMessage
                }
                notificationSettings = {
                    type: 'warning',
                    time: 1000000
                };

                service.pendingNotifications.push(sys.notifications.notify(notificationContent, notificationSettings));
            }
        } else {
            const account = accounts[0];
            checkErrors = function(message, accounts) {
                if (service.provider.networkVersion !== message.netId) {
                    sys.notifications.notify({
                        title: sys.i18n.t('UI services:' + service.name + '.wrongNetworkTitle'),
                        message: sys.i18n.t('UI services:' + service.name + '.wrongNetworkMessage'),
                    }, {
                        type: 'danger',
                        time: 5000
                    });
                    console.log('[metamask] Network ID [' + message.netId + '] did not match with ui service network [' + service.provider.networkVersion + '].');
                    service.callback(message, 'error', {
                        tx: message.data,
                        errorCode: 'invalidNetwork',
                        error: 'Network ID [' + message.netId + '] did not match with ui service network [' + service.provider.networkVersion + '].'
                    });
                    return false;
                }
                if (message.data.from && accounts && accounts.indexOf(message.data.from.toLowerCase()) === -1) {
                    sys.notifications.notify({
                        title: sys.i18n.t('UI services:' + service.name + '.wrongAccountTitle'),
                        message: sys.i18n.t('UI services:' + service.name + '.wrongAccountMessage', {address: message.data.from}),
                    }, {
                        type: 'danger',
                        time: 5000
                    });
                    console.log('[metamask] Account [' + message.data.from + '] is not selected in MetaMask');
                    service.callback(message, 'error', {
                        tx: message.data,
                        errorCode: 'invalidAccount',
                        error: 'Account [' + message.data.from + '] is not selected in MetaMask'
                    });
                    return false;
                }
                return true;
            };
            switch (message.name) {
                case 'sendTransaction': {
                    if (checkErrors(message, accounts)) {
                        try {
                            const transactionHash = await ethereum.request({
                                method: 'eth_sendTransaction',
                                params: message.data
                            });
                            service.callback(message, 'approved', {
                                tx: message.data,
                                txHash: transactionHash
                            });
                        } catch (error) {
                            console.warn('[metamask] Can not send transaction. Tx declined.', error);
                            service.callback(message, 'declined', {
                                tx: message.data,
                                error: error.toString()
                            });
                        }
                    }
                    break;
                }
                case 'signData': {
                    if (checkErrors(message, accounts)) {
                        try {
                            const signature = await ethereum.request({
                                method: 'personal_sign',
                                params: [message.from || account, message.data]
                            });
                            service.callback(message, 'approved', {
                                data: message.data,
                                signedData: signature
                            });
                        } catch (error) {
                            console.warn('[metamask] Can not sign transaction.', error);
                            service.callback(message, 'declined', {
                                tx: message.data,
                                error: error.toString()
                            });
                        }
                    }
                    break;
                }
                case 'getConfigMetamask': {
                    service.callback(message, 'response', {
                        netId: service.provider.networkVersion,
                        defaultAccount: account,
                        accounts: accounts
                    });
                    break;
                }
            }
            return true;
        }
    } catch (error) {
        console.error("[metamask] Error seen processing message", error);
        notificationMessage = '<div>'
            + '  <hr/>'
            + '  <div>' + sys.i18n.t('UI services:' + service.name + '.permissionsDeniedMessage') + '</div>'
            + '</div>';
        notificationContent = {
            title: sys.i18n.t('UI services:' + service.name + '.permissionsDenied'),
            message: notificationMessage
        }
        notificationSettings = {
            type: 'danger',
            time: 1000000
        };
        service.pendingNotifications.push(sys.notifications.notify(notificationContent, notificationSettings));
    }
};
