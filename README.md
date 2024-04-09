<table class="table" style="margin-top: 10px">
    <thead>
    <tr>
        <th>Title</th>
        <th>Last Updated</th>
        <th>Summary</th>
    </tr>
    </thead>
    <tbody>
    <tr>
        <td>Metamask package</td>
        <td>April 9, 2024</td>
        <td>Detailed description of the Metamask UI service.</td>
    </tr>
    </tbody>
</table>

# Overview

This package allows you to connect your SLINGR application to sign transactions using the MetaMask browser extension.

## QuickStart

```js
log(JSON.stringify(pkg.metamask.functions.getConfigMetamask()));
```

# Javascript API

The Javascript API of the OAuth package has :

## Shortcuts

You can make use of the helpers provided in the package:
<details>
    <summary>Click here to see all the helpers</summary>

<br>

* Send transaction
```javascript
pkg.metamask.functions.sendTransaction();
```
Sends a transaction to be signed and sent to the network using the MetaMask package. 
The tx data should be in the `data` field (see eth.sendTransaction for more information), 
while you can receive two events:

* approved: the user approved the transaction, and it was submitted to the network. You should check the status of the transaction to see if it was confirmed. Parameter `msg` contains the original message sent to the package (where you can add more fields if you need them in the callback) while `res` contains the tx object and txHash.
* declined: the user did not approve the transaction,
  or there was a problem, and the tx could not be submitted to the network.
  `msg` contains the original message sent to the plugin, and you could find the error in `res.error`.
  Additionally, there is an `error` callback for handling accounts or network-related errors.
  These are the possible error codes:
  - `invalidAccount`: if the account to sign the transaction is not configured in MetaMask.
  - `invalidNetwork`: if the network MetaMask is connected to is different from the network requested.
---
* Sign data
```javascript
pkg.metamask.functions.signData();
```
Signs data using the MetaMask package. The data to sign should be in the `data` field while you can pass two callbacks:

* approved: the user approved the transaction, and it was signed. You can find the signed data in `res.signedData`.
* declined: the user did not approve the transaction, or there was a problem signing the data.
  You can find the error in `res.error`.
  There are also errors related to the account, and the possible error code is:
  - `invalidAccount`: if the account to sign the transaction is not configured in MetaMask.

---
* Get configuration
```javascript
pkg.metamask.functions.getConfigMetamask();
```
Returns the configuration of MetaMask.
This is useful if you want to check configured accounts or the network MetaMask is currently configured to.
It supports the following callback:

- response: the config is sent in the `res` parameter. This parameter has the following structure:
```json
{
  "netId": 1, 
  "defaultAccount": "0x1...", 
  "accounts": ["0x1...", "0x2..."]
}
```
---

</details>

## UI Service

The Metamask package user a UI service to handle the request.
<details>
    <summary>Click here to see the UI Service</summary>

<br>

### OAuth UI Service

The MetaMask UI Service uses npm dependency of ethereum (MetaMask 4.16.0+)

</details>

# About SLINGR

SLINGR is a low-code rapid application development platform that accelerates development, with robust architecture for integrations and executing custom workflows and automation.

[More info about SLINGR](https://slingr.io)

# License

This package is licensed under the Apache License 2.0. See the `LICENSE` file for more details.
