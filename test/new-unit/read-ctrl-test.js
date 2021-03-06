define(function(require) {
    'use strict';

    var expect = chai.expect,
        angular = require('angular'),
        mocks = require('angularMocks'),
        KeychainDAO = require('js/dao/keychain-dao'),
        InvitationDAO = require('js/dao/invitation-dao'),
        PGP = require('js/crypto/pgp'),
        ReadCtrl = require('js/controller/read'),
        OutboxBO = require('js/bo/outbox'),
        appController = require('js/app-controller');

    describe('Read Controller unit test', function() {
        var scope, ctrl,
            origKeychain, keychainMock,
            origInvitation, invitationMock,
            origCrypto, cryptoMock,
            origOutbox, outboxMock,
            origEmailDao;

        beforeEach(function() {
            origKeychain = appController._keychain;
            appController._keychain = keychainMock = sinon.createStubInstance(KeychainDAO);

            origInvitation = appController._invitationDao;
            appController._invitationDao = invitationMock = sinon.createStubInstance(InvitationDAO);

            origCrypto = appController._crypto;
            appController._crypto = cryptoMock = sinon.createStubInstance(PGP);

            origOutbox = appController._outboxBo;
            appController._outboxBo = outboxMock = sinon.createStubInstance(OutboxBO);

            origEmailDao = appController._emailDao;
            appController._emailDao = {
                _account: 'sender@example.com'
            };

            angular.module('readtest', []);
            mocks.module('readtest');
            mocks.inject(function($rootScope, $controller) {
                scope = $rootScope.$new();
                scope.state = {};
                ctrl = $controller(ReadCtrl, {
                    $scope: scope
                });
            });
        });

        afterEach(function() {
            appController._keychain = origKeychain;
            appController._invitationDao = origInvitation;
            appController._crypto = origCrypto;
            appController._outboxBo = origOutbox;
            appController._emailDao = origEmailDao;
        });

        describe('scope variables', function() {
            it('should be set correctly', function() {
                expect(scope.state.read).to.exist;
                expect(scope.state.read.open).to.be.false;
                expect(scope.state.read.toggle).to.exist;
            });
        });

        describe('open/close read view', function() {
            it('should open/close', function() {
                expect(scope.state.read.open).to.be.false;
                scope.state.read.toggle(true);
                expect(scope.state.read.open).to.be.true;
                scope.state.read.toggle(false);
                expect(scope.state.read.open).to.be.false;
            });
        });

        describe('getKeyId', function() {
            var address = 'asfd@asdf.com';

            it('should show searching on error', function() {
                expect(scope.keyId).to.equal('No key found.');
                keychainMock.getReceiverPublicKey.yields(42);

                scope.onError = function(err) {
                    expect(err).to.equal(42);
                    expect(scope.keyId).to.equal('Searching...');
                };

                scope.getKeyId(address);
            });

            it('should allow invitation on empty key', function() {
                keychainMock.getReceiverPublicKey.yields();

                scope.onError = function(err) {
                    expect(err).not.exist;
                    expect(scope.keyId).to.equal('User has no key. Click to invite.');
                };

                scope.getKeyId(address);
            });

            it('should show searching on error', function() {
                keychainMock.getReceiverPublicKey.yields(null, {
                    publicKey: 'PUBLIC KEY'
                });

                cryptoMock.getFingerprint.returns('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX');

                scope.onError = function(err) {
                    expect(err).to.not.exist;
                    expect(scope.keyId).to.equal('PGP key: XXXXXXXX');
                };

                scope.getKeyId(address);
            });
        });

        describe('invite', function() {
            it('not allow invitation for secure users', function() {
                expect(scope.keyId).to.equal('No key found.');

                scope.invite({
                    secure: true,
                    address: 'asdf@asdf.de'
                });

                expect(scope.keyId).to.equal('No key found.');
            });

            it('should show error on invitation dao invite error', function() {
                invitationMock.invite.yields(42);

                scope.onError = function(err) {
                    expect(err).to.equal(42);
                };

                scope.invite({
                    address: 'asdf@asdf.de'
                });
            });

            it('should show error on outbox put error', function() {
                invitationMock.invite.yields();
                outboxMock.put.yields(42);

                scope.onError = function(err) {
                    expect(err).to.equal(42);
                };

                scope.invite({
                    address: 'asdf@asdf.de'
                });
            });

            it('should work', function() {
                invitationMock.invite.yields();
                outboxMock.put.yields();

                scope.onError = function(err) {
                    expect(err).to.not.exist;
                };

                scope.invite({
                    address: 'asdf@asdf.de'
                });
            });
        });

        describe('parseConversation', function() {
            it('should work', function() {
                var body = 'foo\n' +
                    '\n' +
                    '> bar\n' +
                    '>\n' +
                    '> foofoo\n' +
                    '>> foofoobar\n' +
                    '\ncomment\n' +
                    '>> barbar';

                var nodes = scope.parseConversation({
                    body: body
                });
                expect(nodes).to.exist;

                var expected = '{"children":["foo\\n",{"children":["bar\\n\\nfoofoo",{"children":["foofoobar"]}]},"\\ncomment",{"children":[{"children":["barbar"]}]}]}';
                var json = JSON.stringify(nodes);
                expect(json).to.equal(expected);
            });
        });

    });
});