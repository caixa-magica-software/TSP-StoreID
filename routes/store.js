'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const web3 = new Web3();
const conn = require('./../models/store');

function isBase64(str) {
	try {
		return Buffer.from(Buffer.from(str, 'base64').toString()).toString('base64') == str;

	} catch (err) {
		return false;
	}
}

router.get('/', function(req, res, next) {
	let hash = (req.query.hash != null) ? req.query.hash : null;
	let	wa = (req.query.wallet_address != null) ? req.query.wallet_address.toLowerCase() : null;

	if (hash !== null && wa !== null) {
		conn.getInfoById({ 'hash': hash, 'wallet_address': wa }, function(err, result) {
			if (err) return res.status(500).send({ "data": null, "message": err });

			if (!result) return res.status(404).send({ "data": null, "message": "No records" });

			res.status(200).send({ "data": result, "message": null });
		});

	} else {
		return res.status(404).send({ "data": null, "message": "No records" });
	}
});

router.post('/', function(req, res, next) {
	console.log('body: ', req.body);
	let request = req.body;
	let criteria = {
		'hash': request.hash,
		'wallet_address': request.wallet_address
	};

	delete request.hash;
	delete request.wallet_address;
	let isValid = true;

	// Validar hash em base64
	console.log('Validate if hash is base64 encoded');
	let validBase64 = isBase64(criteria.hash);
	console.log(validBase64);
	isValid = isValid && validBase64;

	// Validar se assinatura corresponde ao hash
	console.log('Validate if the signature matches the hash');
	let signedWithAddress = web3.eth.accounts.recover(criteria.hash, request.hash_metamask);
	let validAddr = (criteria.wallet_address === signedWithAddress) ? true : false;
	console.log(validAddr);
	isValid = isValid && validAddr;

	if (isValid) {
		conn.addOrUpdateInfo(criteria, request, function(err, result) {
			if (err) {
				console.error('ERROR: ', err);
				res.status(500).send({ "data": null, "message": err });

			} else {
				res.status(200).send({ "data": null, "message": "Data stored" });
			}
		});

	} else {
		console.error('ERROR: Validation failed');
		res.status(500).send({ "data": null, "message": 'Validation failed for hash: ' + criteria.hash + ' and wallet address: ' + criteria.wallet_address });
	}
});

module.exports = router;
