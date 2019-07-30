const Helper = require("hubot-test-helper");
const helper = new Helper("../scripts");
const Promise = require("bluebird");
const fs = require("fs");

const co = require("co");
const expect = require("chai").expect;

describe("test --help", function() {
    beforeEach(function() {
        this.room = helper.createRoom();
    });
    afterEach(function() {
        this.room.destroy();
    });

    context("user send help", function() {
        beforeEach(function() {
            return co(function*() {
                yield this.room.user.say("phlopchikov", "--help");
                yield new Promise.delay(1000);
            }.bind(this));
        });

        it("Check --help", function() {
            expect(this.room.messages[1]).to.not.undefined;
            expect(this.room.messages[1][1]).to.not.eql("");
        });
    });
});