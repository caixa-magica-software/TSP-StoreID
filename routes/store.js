'use strict';

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const conn = require('./../models/store');

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
	let request = req.body;
	let criteria = {
		'hash': request.hash,
		'wallet_address': request.wallet_address
	};

	delete request.hash;
	delete request.wallet_address;

	let pubkey = new Buffer(request.metamask_pubkey, 'base64');
	let isValid = crypto.createVerify('sha256').update(criteria.hash).verify(pubkey, request.hash_metamask, 'base64');

	if (isValid) {
		conn.addOrUpdateInfo(criteria, request, function(err, result) {
			if (err) return res.status(500).send({ "data": null, "message": err });

			res.status(200).send({ "data": null, "message": "Data stored" });
		});

	} else {
		return res.status(500).send({ "data": null, "message": 'Validation failed for hash: ' + criteria.hash + ' and wallet address: ' + criteria.wallet_address });
	}
});

module.exports = router;
