define(['js/dao/email-dao', 'js/dao/keychain-dao', 'js/dao/lawnchair-dao',
	'js/crypto/crypto', 'js/dao/devicestorage-dao', 'test/test-data', 'js/app-config'
], function(EmailDAO, KeychainDAO, jsonDao, crypto, storage, testData, app) {
	'use strict';

	module("Email DAO");

	var emaildaoTest = {
		user: 'test@atlasdev.onmicrosoft.com',
		password: 'Xoza76645',
		keySize: 128,
		ivSize: 128,
		rsaKeySize: 1024
	};

	asyncTest("Init", 3, function() {
		// init dependencies
		jsonDao.init(emaildaoTest.user);
		// cloud storage stub
		emaildaoTest.cloudstorageStub = {
			putPublicKey: function(pk, callback) {
				callback();
			},
			putPrivateKey: function(prk, callback) {
				callback();
			},
			getPublicKeyByUserId: function(userId, callback) {
				callback();
			}
		};
		emaildaoTest.keychain = new KeychainDAO(emaildaoTest.cloudstorageStub);
		emaildaoTest.emailDao = new EmailDAO(emaildaoTest.cloudstorageStub, emaildaoTest.keychain);

		// generate test data
		emaildaoTest.list = testData.getEmailCollection(100);

		var account = new app.model.Account({
			emailAddress: emaildaoTest.user,
			symKeySize: emaildaoTest.keySize,
			symIvSize: emaildaoTest.ivSize,
			asymKeySize: emaildaoTest.rsaKeySize
		});

		// clear db before tests
		jsonDao.clear(function(err) {
			ok(!err, 'DB cleared. Error status: ' + err);

			emaildaoTest.emailDao.init(account, emaildaoTest.password, function(err) {
				ok(!err);
				equal(emaildaoTest.emailDao.account.get('emailAddress'), emaildaoTest.user, 'Email DAO Account');

				start();
			});
		});
	});

	asyncTest("Persist test emails (stubbed sync from cloud)", 4, function() {
		emaildaoTest.keychain.getUserKeyPair(emaildaoTest.user, function(err, keypair) {
			ok(!err && keypair, 'Fetch keypair from keychain');

			var receiverPubkeys = [keypair.publicKey];

			crypto.encryptListForUser(emaildaoTest.list, receiverPubkeys, function(err, encryptedList) {
				ok(!err);
				equal(encryptedList.length, emaildaoTest.list.length, 'Encrypt list');

				// add sent date to encrypted items
				for (var i = 0; i < encryptedList.length; i++) {
					encryptedList[i].sentDate = emaildaoTest.list[i].sentDate;
				}

				// set encrypted test list as return value for cloud storage stub
				emaildaoTest.cloudstorageStub.listEncryptedItems = function(type, emailAddress, folderName, callback) {
					callback(null, encryptedList);
				};

				emaildaoTest.emailDao.syncFromCloud('inbox', function() {
					ok(true, 'Stored encrypted list');

					start();
				});
			});
		});
	});

	asyncTest("List Email models", 2, function() {
		emaildaoTest.emailDao.listItems('inbox', 0, emaildaoTest.list.length, function(err, gotten) {
			ok(!err);

			var reference = emaildaoTest.list;

			deepEqual(gotten, reference, 'Compare collection');

			start();
		});
	});

	asyncTest("Get item", 1, function() {
		var item = emaildaoTest.list[0];
		var mail = emaildaoTest.emailDao.getItem('inbox', item.id);
		deepEqual(mail, item, 'Item correct');
		start();
	});

});