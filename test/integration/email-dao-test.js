define(function(require) {
    'use strict';

    var appController = require('js/app-controller'),
        PgpMailer = require('pgpmailer'),
        mailreader = require('mailreader'),
        ImapClient = require('imap-client'),
        openpgp = require('openpgp'),
        expect = chai.expect;

    chai.Assertion.includeStack = true;

    describe('Email DAO integration tests', function() {
        var emailDao, userStorage, configStorage, // live objects
            imapClientStub, pgpMailerStub, // stubs
            wellKnownFolders, privKey, pubkeyArmored, keypair, imapFolder, emailAddress, message;

        beforeEach(function(done) {
            // those are the folders on the imap server (-> mock)
            wellKnownFolders = {
                inbox: {
                    type: 'Inbox',
                    path: 'INBOX'
                }
            };

            // the mock imap folder we use           
            imapFolder = 'INBOX';

            // keys for safewithme.testuser
            emailAddress = 'safewithme.testuser@gmail.com';
            privKey = '-----BEGIN PGP PRIVATE KEY BLOCK-----\r\nVersion: OpenPGP.js v.1.20131116\r\nComment: Whiteout Mail - http://whiteout.io\r\n\r\nxcL+BFKODs4BB/9iOF4THsjQMY+WEpT7ShgKxj4bHzRRaQkqczS4nZvP0U3g\r\nqeqCnbpagyeKXA+bhWFQW4GmXtgAoeD5PXs6AZYrw3tWNxLKu2Oe6Tp9K/XI\r\nxTMQ2wl4qZKDXHvuPsJ7cmgaWqpPyXtxA4zHHS3WrkI/6VzHAcI/y6x4szSB\r\nKgSuhI3hjh3s7TybUC1U6AfoQGx/S7e3WwlCOrK8GTClirN/2mCPRC5wuIft\r\nnkoMfA6jK8d2OPrJ63shy5cgwHOjQg/xuk46dNS7tkvGmbaa+X0PgqSKB+Hf\r\nYPPNS/ylg911DH9qa8BqYU2QpNh9jUKXSF+HbaOM+plWkCSAL7czV+R3ABEB\r\nAAH+AwMI8l5bp5J/xgpguvHaT2pX/6D8eU4dvODsvYE9Y4Clj0Nvm2nu4VML\r\nniNb8qpzCXXfFqi1FWGrZ2msClxA1eiXfk2IEe5iAiY3a+FplTevBn6rkAMw\r\nly8wGyiNdE3TVWgCEN5YRaTLpfV02c4ECyKk713EXRAtQCmdty0yxv5ak9ey\r\nXDUVd4a8T3QMgHcAOTXWMFJNUjeeiIdiThDbURJEv+9F+DW+4w5py2iw0PYJ\r\nNm6iAHCjoPQTbGLxstl2BYSocZWxG1usoPKhbugGZK0Vr8rdpsfakjJ9cJUg\r\nYHIH3VT+y+u5mhY681NrB5koRUxDT6ridbytMcoK8xpqYG3FhC8CiVnzpDQ3\r\no1KRkWuxUq66oJhu0wungXcqaDzDUEfeUjMuKVI/d9/ViXy8IH/XdlOy0lLY\r\nOac0ovRjb7zgeVOp2e7N4eTu0dts3SE+Do1gyqZo2rf1dwsJQI9YUtpjYAtr\r\nNBkKyRvBAhg9KPh1y2Y1u3ra5OS0yGuNDD8pXdiN3kxMt5OBlnWeFjL6ll7+\r\nvgiKZooPUZPbFIWi4XBXTv7D5T9THDYmuJpcOffn1AA7j2FM8fkFvtiFyw9J\r\n2S14penv2R7TeybxR6ktD7HtZd34gmGvmOxhWRNU/vfp4SisUcu9jzQq+cJt\r\njoWuJiZ8xvWEC2DD32n9bWyIlGhS4hATqz/gEdSha8hxzT+GJi29jYjp8Hnc\r\n9HwxOArz6Q5h/nDN2Xt5PuCM65J0dathzAm0A7BLRQI+4OjTW575sRKvarzH\r\n8JZ+UYK2BgP4Kbh9JqhnD/2NKD/csuL6No5guyOH8+zekdBtFE394SV8e9N+\r\nzYgzVex4SDG8y/YO7W7Tp6afNb+sqyzEw5Bknypn0Hc3cr9wy1P8jLMM2woL\r\nGRDZ5IutCAV/D/h881dHJs0tV2hpdGVvdXQgVXNlciA8c2FmZXdpdGhtZS50\r\nZXN0dXNlckBnbWFpbC5jb20+wsBcBBABCAAQBQJSjg7aCRDX+5P837/CPAAA\r\n3ZwH/2AVGYB+8RDarP5a5uZPYSxJKeM8zHMbi7LKQWhr5NpkJajZdra1CCGZ\r\nTXTeQSRBvU4SNGOmDAlhf0qCGeXwMHIzrzovkBedHIc/vypEkItdJeXQAaJx\r\nuhQOnmyi9priuzBBx4e9x1aBn+aAdNGiJB4l13L2T4fow8WLIVpVwXB6BWya\r\nlz50JwLzJP6qHxkhvIZElTrQ+Yoo3stS6w/7wNtK/f3MIYkIGVVUrIDgzN0X\r\nm4z6ypN1dsrM6tPkMZ0JlqjHiz7DXpKrWsfNkoVZ9A98osMH2nIDS58JVEDc\r\nAXoFSLsbdmqFmIc2Ew828TjlX+FLU9tlx89WhSMTapzUjHU=\r\n=wxuK\r\n-----END PGP PRIVATE KEY BLOCK-----';
            pubkeyArmored = '-----BEGIN PGP PUBLIC KEY BLOCK-----\r\nVersion: OpenPGP.js v.1.20131116\r\nComment: Whiteout Mail - http://whiteout.io\r\n\r\nxsBNBFKODs4BB/9iOF4THsjQMY+WEpT7ShgKxj4bHzRRaQkqczS4nZvP0U3g\r\nqeqCnbpagyeKXA+bhWFQW4GmXtgAoeD5PXs6AZYrw3tWNxLKu2Oe6Tp9K/XI\r\nxTMQ2wl4qZKDXHvuPsJ7cmgaWqpPyXtxA4zHHS3WrkI/6VzHAcI/y6x4szSB\r\nKgSuhI3hjh3s7TybUC1U6AfoQGx/S7e3WwlCOrK8GTClirN/2mCPRC5wuIft\r\nnkoMfA6jK8d2OPrJ63shy5cgwHOjQg/xuk46dNS7tkvGmbaa+X0PgqSKB+Hf\r\nYPPNS/ylg911DH9qa8BqYU2QpNh9jUKXSF+HbaOM+plWkCSAL7czV+R3ABEB\r\nAAHNLVdoaXRlb3V0IFVzZXIgPHNhZmV3aXRobWUudGVzdHVzZXJAZ21haWwu\r\nY29tPsLAXAQQAQgAEAUCUo4O2gkQ1/uT/N+/wjwAAN2cB/9gFRmAfvEQ2qz+\r\nWubmT2EsSSnjPMxzG4uyykFoa+TaZCWo2Xa2tQghmU103kEkQb1OEjRjpgwJ\r\nYX9Kghnl8DByM686L5AXnRyHP78qRJCLXSXl0AGicboUDp5sovaa4rswQceH\r\nvcdWgZ/mgHTRoiQeJddy9k+H6MPFiyFaVcFwegVsmpc+dCcC8yT+qh8ZIbyG\r\nRJU60PmKKN7LUusP+8DbSv39zCGJCBlVVKyA4MzdF5uM+sqTdXbKzOrT5DGd\r\nCZaox4s+w16Sq1rHzZKFWfQPfKLDB9pyA0ufCVRA3AF6BUi7G3ZqhZiHNhMP\r\nNvE45V/hS1PbZcfPVoUjE2qc1Ix1\r\n=7Wpe\r\n-----END PGP PUBLIC KEY BLOCK-----';

            // the dummy message
            message = {
                uid: 123,
                encrypted: true,
                from: [{
                    address: emailAddress
                }],
                to: [{
                    address: emailAddress
                }]
            };

            // don't multithread, Function.prototype.bind() is broken in phantomjs in web workers
            window.Worker = undefined;
            sinon.stub(openpgp, 'initWorker', function() {});
            sinon.stub(mailreader, 'startWorker', function() {});

            // create the stubs for imap and smtp modules
            pgpMailerStub = sinon.createStubInstance(PgpMailer);
            imapClientStub = sinon.createStubInstance(ImapClient);
            imapClientStub.login.yields();
            imapClientStub.listWellKnownFolders.yields(null, wellKnownFolders);

            // this circumvents fetching the oauth token and ssl certificate in phantomjs
            sinon.stub(appController, 'onConnect', function(cb) {
                appController._emailDao.onConnect({
                    imapClient: imapClientStub,
                    pgpMailer: pgpMailerStub
                }, cb);
            });

            // simulate the app startup
            appController.start({
                onError: function() {}
            }, onStart);

            function onStart(err) {
                expect(err).to.not.exist;

                appController.buildModules();
                emailDao = appController._emailDao;
                userStorage = appController._userStorage;
                configStorage = appController._appConfigStore;

                appController.init({
                    emailAddress: emailAddress,
                }, onInit);
            }

            function onInit(err) {
                expect(err).to.not.exist;

                keypair = {
                    privateKey: {
                        _id: appController._crypto.getKeyId(privKey),
                        userId: emailAddress,
                        encryptedKey: privKey
                    },
                    publicKey: {
                        _id: appController._crypto.getKeyId(pubkeyArmored),
                        userId: emailAddress,
                        publicKey: pubkeyArmored
                    }
                };

                emailDao.unlock({
                    keypair: keypair,
                    passphrase: 'passphrase'
                }, done);
            }
        });

        afterEach(function(done) {
            openpgp.initWorker.restore();
            mailreader.startWorker.restore();
            appController.onConnect.restore();

            // clean the whole db
            userStorage.clear(function() {
                configStorage.clear(done);
            });
        });

        describe('mail decryption', function() {
            var emails = [{
                testCase: 'enigmail encrypted pgp/mime with attachment',
                testCiphertext: '-----BEGIN PGP MESSAGE-----\r\nVersion: GnuPG/MacGPG2 v2.0.22 (Darwin)\r\nComment: GPGTools - http://gpgtools.org\r\nComment: Using GnuPG with Thunderbird - http://www.enigmail.net/\r\n\r\n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\r\n=ZQ8O\r\n-----END PGP MESSAGE-----',
                testHasAttachment: true
            }, {
                testCase: 'enigmail encrypted signed pgp/mime with attachment',
                testCiphertext: '-----BEGIN PGP MESSAGE-----\r\nVersion: GnuPG/MacGPG2 v2.0.22 (Darwin)\r\nComment: GPGTools - http://gpgtools.org\r\nComment: Using GnuPG with Thunderbird - http://www.enigmail.net/\r\n\r\n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\r\nyjGWLplWnA==\r\n=p4q6\r\n-----END PGP MESSAGE-----',
                testHasAttachment: true
            }];

            beforeEach(function(done) {
                // this is the state after a successful sync, where the message's metadata is in the database
                var dbType = 'email_' + imapFolder;
                userStorage.storeList([message], dbType, done);
            });

            emails.forEach(function(testOptions) {
                it('should handle ' + testOptions.testCase + ' correctly', function(done) {
                    this.timeout(10000);

                    // stub the imap roundtrip
                    imapClientStub.getBody.withArgs(sinon.match(function(opts) {
                        expect(opts.path).to.equal(imapFolder);
                        expect(opts.message).to.equal(message);

                        message.body = testOptions.testCiphertext;

                        return true;
                    })).yields();

                    // get the body and decrypt it
                    emailDao.getBody({
                        message: message,
                        folder: imapFolder
                    }, function(err) {
                        expect(err).to.not.exist;

                        emailDao.decryptBody({
                            message: message,
                            folder: imapFolder
                        }, function(err) {
                            expect(err).to.not.exist;
                            expect(message.body).to.contain('asdf');
                            expect(message.attachments.length > 0).to.equal(testOptions.testHasAttachment);

                            done();
                        });
                    });
                });
            });
        });
    });
});