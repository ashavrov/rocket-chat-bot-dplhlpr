const Helper = require("hubot-test-helper");
const co = require("co");
const expect = require("chai").expect;

const helper = new Helper("../scripts");
const scriptHelper = new Helper("./scripts/help.js");

describe("test --obj", function() {
    beforeEach(function() {
        this.room = helper.createRoom();
    });
    afterEach(function() {
        this.room.destroy();
    });

    context("user want add objects to release", function() {
        beforeEach(function() {
            return co(function*() {
                yield this.room.user.say("phlopchikov", "--obj");
                yield this.room.user.say("phlopchikov", "--obj\r\n\r\nBC:Contact");
                yield this.room.user.say("phlopchikov", "--obj ufo-1");
                yield this.room.user.say("phlopchikov", "--obj ufo-2\r\n23Q5\r\nOpportunity");
                yield this.room.user.say("phlopchikov", "--obj ufo-3\r\n23Q5\r\n:Opportunity");
                yield this.room.user.say("phlopchikov", "--obj ufo-4\r\n23Q5\r\nBC:");
                yield this.room.user.say("phlopchikov", "--obj ufo-5\r\n23Q5\r\nBC:Opportunity");
                yield this.room.user.say("phlopchikov", "--obj ufo-6\r\n23Q5\r\nBC:Opportunity, Contact");
                yield this.room.user.say("phlopchikov", "--obj ufo-7\r\n23Q5\r\nBC:Opportunity, Contact, Account\r\nApplet:Contact Form Applet");
                yield this.room.user.say("phlopchikov", "--obj ufo-8\r\n23Q5\r\nBC:Opportunity, Contact, Account\r\nApplet:Contact Form Applet, Account Pick Applet");
                yield this.room.user.say("phlopchikov", "--obj ufo-8\r\n23Q5\r\nBC:Opportunity, Contact, Account\r\nApplet:Contact Form Applet 3, ");
                yield this.room.user.say("phlopchikov", "--obj https://jira.otpbank.ru:8443/browse/ufo-9\r\n23Q5\r\nBC:Opportunity, Contact, Account\r\nApplet:Contact Form Applet 3 ");
            }.bind(this));
        });

        it("bot answer user", function() {
            expect(this.room.messages).to.eql([
                ["phlopchikov", "--obj"],
                ["hubot", "@phlopchikov \r\nНужно ввести тикет Jira!"],

                ["phlopchikov", "--obj\r\n\r\nBC:Contact"],
                ["hubot", "@phlopchikov \r\nНужно ввести тикет Jira!"],

                ["phlopchikov", "--obj ufo-1"],
                ["hubot", "@phlopchikov \r\nНужно ввести название проекта!"],

                ["phlopchikov", "--obj ufo-2\r\n23Q5\r\nOpportunity"],
                ["hubot", "@phlopchikov \r\nНекорректный формат строки!\r\nв строке: \r\nOpportunity"],

                ["phlopchikov", "--obj ufo-3\r\n23Q5\r\n:Opportunity"],
                ["hubot", "@phlopchikov \r\nНужно ввести тип объекта!\r\nв строке: \r\n:Opportunity"],

                ["phlopchikov", "--obj ufo-4\r\n23Q5\r\nBC:"],
                ["hubot", "@phlopchikov \r\nНужно ввести название объекта!\r\nв строке: \r\nBC:"],

                ["phlopchikov", "--obj ufo-5\r\n23Q5\r\nBC:Opportunity"],
                ["hubot", "@phlopchikov \r\n done"],

                ["phlopchikov", "--obj ufo-6\r\n23Q5\r\nBC:Opportunity, Contact"],
                ["hubot", "@phlopchikov \r\n done"],

                ["phlopchikov", "--obj ufo-7\r\n23Q5\r\nBC:Opportunity, Contact, Account\r\nApplet:Contact Form Applet"],
                ["hubot", "@phlopchikov \r\n done"],

                ["phlopchikov", "--obj ufo-8\r\n23Q5\r\nBC:Opportunity, Contact, Account\r\nApplet:Contact Form Applet, Account Pick Applet"],
                ["hubot", "@phlopchikov \r\n done"],

                ["phlopchikov", "--obj ufo-8\r\n23Q5\r\nBC:Opportunity, Contact, Account\r\nApplet:Contact Form Applet 3, "],
                ["hubot", "@phlopchikov \r\nНужно ввести название объекта!\r\nв строке: \r\nApplet:Contact Form Applet 3, "],

                ["phlopchikov", "--obj https://jira.otpbank.ru:8443/browse/ufo-9\r\n23Q5\r\nBC:Opportunity, Contact, Account\r\nApplet:Contact Form Applet 3 "],
                ["hubot", "@phlopchikov \r\n done"]
            ]);
        });
    });
});