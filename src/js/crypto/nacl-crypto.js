/**
 * A Wrapper for NaCl's asymmetric/symmetric crypto
 */
app.crypto.NaclCrypto = function() {
	'use strict';

	/**
	 * Generates a baes64 encoded keypair for use with NaCl
	 */
	this.generateKeypair = function(seed) {
		if (seed) {
			return null; // TODO: generate from PBKDF2
		} else {
			var keys = nacl.crypto_box_keypair();
			return {
				boxPk: window.btoa(nacl.decode_latin1(keys.boxPk)),
				boxSk: window.btoa(nacl.decode_latin1(keys.boxSk))
			};
		}
	};

	/**
	 * Asymmetrically encrypt a String
	 * @param plaintext [String] The input string in UTF8
	 * @param recipientBoxPk [String] The receiver's base64 encoded public key
	 * @param senderBoxSk [String] The sender's base64 encoded private key
	 * @return [Object] The base64 encoded ciphertext and nonce
	 */
	this.asymmetricEncrypt = function(plaintext, recipientBoxPk, senderBoxSk) {
		// convert to Uint8Array
		var ptBuf = nacl.encode_utf8(plaintext);
		var recipientBoxPkBuf = nacl.encode_latin1(window.atob(recipientBoxPk));
		var senderBoxSkBuf = nacl.encode_latin1(window.atob(senderBoxSk));
		// generate nonce
		var nonce = nacl.crypto_secretbox_random_nonce();

		var ct = nacl.crypto_box(ptBuf, nonce, recipientBoxPkBuf, senderBoxSkBuf);
		var ctBase64 = window.btoa(nacl.decode_latin1(ct));
		var nonceBase64 = window.btoa(nacl.decode_latin1(nonce));

		return {
			ct: ctBase64,
			nonce: nonceBase64
		};
	};

	/**
	 * Asymmetrically decrypt a String
	 * @param ciphertext [String] The base64 encoded ciphertext
	 * @param nonce [String] The base64 encoded nonce
	 * @param senderBoxPk [String] The sender's base64 encoded public key
	 * @param recipientBoxSk [String] The receiver's base64 encoded private key
	 * @return [String] The decrypted plaintext in UTF8
	 */
	this.asymmetricDecrypt = function(ciphertext, nonce, senderBoxPk, recipientBoxSk) {
		// convert to Uint8Array
		var ctBuf = nacl.encode_latin1(window.atob(ciphertext));
		var nonceBuf = nacl.encode_latin1(window.atob(nonce));
		var senderBoxPkBuf = nacl.encode_latin1(window.atob(senderBoxPk));
		var recipientBoxSkBuf = nacl.encode_latin1(window.atob(recipientBoxSk));

		var pt = nacl.crypto_box_open(ctBuf, nonceBuf, senderBoxPkBuf, recipientBoxSkBuf);
		var ptStr = nacl.decode_utf8(pt);

		return ptStr;
	};

};