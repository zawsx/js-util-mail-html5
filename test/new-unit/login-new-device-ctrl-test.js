define(function(require) {
    'use strict';

    var expect = chai.expect,
        angular = require('angular'),
        mocks = require('angularMocks'),
        PGP = require('js/crypto/pgp'),
        LoginNewDeviceCtrl = require('js/controller/login-new-device'),
        KeychainDAO = require('js/dao/keychain-dao'),
        EmailDAO = require('js/dao/email-dao'),
        appController = require('js/app-controller');

    describe('Login (new device) Controller unit test', function() {
        var scope, ctrl, origEmailDao, emailDaoMock, pgpMock,
            emailAddress = 'fred@foo.com',
            passphrase = 'asd',
            keyId,
            keychainMock;

        beforeEach(function() {
            // remember original module to restore later
            origEmailDao = appController._emailDao;

            emailDaoMock = sinon.createStubInstance(EmailDAO);
            appController._emailDao = emailDaoMock;

            keyId = '9FEB47936E712926';
            emailDaoMock._keychain = keychainMock = sinon.createStubInstance(KeychainDAO);
            appController._crypto = pgpMock = sinon.createStubInstance(PGP);

            emailDaoMock._account = {
                emailAddress: emailAddress,
            };

            angular.module('loginnewdevicetest', []);
            mocks.module('loginnewdevicetest');
            mocks.inject(function($rootScope, $controller) {
                scope = $rootScope.$new();
                scope.state = {
                    ui: {}
                };
                ctrl = $controller(LoginNewDeviceCtrl, {
                    $scope: scope
                });
            });
        });

        afterEach(function() {
            // restore the module
            appController._emailDao = origEmailDao;
        });

        describe('initial state', function() {
            it('should be well defined', function() {
                expect(scope.incorrect).to.be.false;
                expect(scope.confirmPassphrase).to.exist;
            });
        });

        describe('confirm passphrase', function() {
            it('should unlock crypto with a public key on the server', function() {
                scope.passphrase = passphrase;
                scope.key = {
                    privateKeyArmored: 'b'
                };

                pgpMock.getKeyId.returns(keyId);

                keychainMock.getUserKeyPair.withArgs(emailAddress).yields(null, {
                    _id: keyId,
                    publicKey: 'a'
                });
                emailDaoMock.unlock.withArgs(sinon.match.any, passphrase).yields();
                keychainMock.putUserKeyPair.yields();

                scope.confirmPassphrase();

                expect(emailDaoMock.unlock.calledOnce).to.be.true;
                expect(keychainMock.getUserKeyPair.calledOnce).to.be.true;
            });

            it('should unlock crypto with no key on the server', function() {
                scope.passphrase = passphrase;
                scope.key = {
                    privateKeyArmored: 'b',
                    publicKeyArmored: 'a'
                };

                pgpMock.getKeyId.returns(keyId);

                keychainMock.getUserKeyPair.withArgs(emailAddress).yields();
                emailDaoMock.unlock.withArgs(sinon.match.any, passphrase).yields();
                keychainMock.putUserKeyPair.yields();

                scope.confirmPassphrase();

                expect(emailDaoMock.unlock.calledOnce).to.be.true;
                expect(keychainMock.getUserKeyPair.calledOnce).to.be.true;
            });

            it('should not work when keypair upload fails', function(done) {
                scope.passphrase = passphrase;
                scope.key = {
                    privateKeyArmored: 'b'
                };

                keychainMock.getUserKeyPair.withArgs(emailAddress).yields(null, {
                    _id: keyId,
                    publicKey: 'a'
                });
                emailDaoMock.unlock.yields();
                keychainMock.putUserKeyPair.yields({
                    errMsg: 'yo mamma.'
                });

                scope.onError = function(err) {
                    expect(err.errMsg).to.equal('yo mamma.');
                    done();
                };

                scope.confirmPassphrase();

                expect(keychainMock.getUserKeyPair.calledOnce).to.be.true;
                expect(emailDaoMock.unlock.calledOnce).to.be.true;
                expect(keychainMock.putUserKeyPair.calledOnce).to.be.true;
            });

            it('should not work when unlock fails', function(done) {
                scope.passphrase = passphrase;
                scope.key = {
                    privateKeyArmored: 'b'
                };

                keychainMock.getUserKeyPair.withArgs(emailAddress).yields(null, {
                    _id: keyId,
                    publicKey: 'a'
                });
                emailDaoMock.unlock.yields({
                    errMsg: 'yo mamma.'
                });

                scope.onError = function(err) {
                    expect(err.errMsg).to.equal('yo mamma.');
                    done();
                };

                scope.confirmPassphrase();

                expect(scope.incorrect).to.be.true;
                expect(keychainMock.getUserKeyPair.calledOnce).to.be.true;
                expect(emailDaoMock.unlock.calledOnce).to.be.true;
            });

            it('should not work when keypair retrieval', function(done) {
                scope.passphrase = passphrase;

                keychainMock.getUserKeyPair.withArgs(emailAddress).yields({
                    errMsg: 'yo mamma.'
                });

                scope.onError = function(err) {
                    expect(err.errMsg).to.equal('yo mamma.');
                    done();
                };

                scope.confirmPassphrase();

                expect(keychainMock.getUserKeyPair.calledOnce).to.be.true;
            });
        });
    });
});