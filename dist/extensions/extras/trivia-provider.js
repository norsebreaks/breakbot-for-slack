"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriviaProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const trivia_record_1 = require("../../models/trivia-record");
const he_1 = __importDefault(require("he"));
const global_settings_1 = require("../global-settings");
const trivia_question_1 = require("../../models/trivia-question");
const message_handler_1 = require("../message-handler");
const fs = __importStar(require("fs"));
class TriviaProvider {
    static triviaActive() {
        if (this.currentQuestion != null) {
            return true;
        }
        return false;
    }
    //Messages/Responses
    static questionMessage(triviaQuestion) {
        return (`:hearts: :spades: :diamonds: :clubs: \n` +
            `*Breakbot Trivia Time!*\n\n` +
            `${triviaQuestion}\n\n\n\n\n`);
    }
    static trueOrFalseMessage() {
        return `*True or False???*\n` + `:hearts: :spades: :diamonds: :clubs:`;
    }
    static incorrectAnswerMessage(userId) {
        return `Sorry *<@${userId}>*, wrong answer.`;
    }
    static correctAnswerMessage(userId, pointsAssigned) {
        return (`Hooray!!! *<@${userId}>* got the correct answer of *${this.currentQuestion.correctAnswer}*\n` +
            `:hearts: :spades: :diamonds: :clubs:\n\n` +
            `You get *${pointsAssigned}* ${global_settings_1.GlobalSettings.triviaPointName}s! - Don't spend them all at once!`);
    }
    static userTotalPointsMessage(userId, points) {
        return `*<@${userId}>*, you currently have *${points}* ${global_settings_1.GlobalSettings.triviaPointName}s!`;
    }
    static userNoPointsMessage(userId) {
        return `*<@${userId}>*, you don't currently have ANY ${global_settings_1.GlobalSettings.triviaPointName}s! \n Answer some trivia to earn some!`;
    }
    //Trivia logic
    static getRandomPoints() {
        var min = Math.ceil(1);
        var max = Math.floor(100);
        return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
    }
    static postQuestionToChannel() {
        axios_1.default.get("https://opentdb.com/api.php?amount=1").then((res) => {
            if (global_settings_1.GlobalSettings.verboseLogging) {
                console.log(res.data.results[0]);
            }
            var results = res.data.results[0];
            var questionInfo = {
                category: results.category,
                type: results.type,
                difficulty: results.difficulty,
                question: he_1.default.decode(results.question),
                correctAnswer: he_1.default.decode(results.correct_answer),
            };
            function decodedIncorrectAnswers() {
                var answers = [];
                results.incorrect_answers.forEach((answer) => {
                    answers.push(he_1.default.decode(answer));
                });
                return answers;
            }
            questionInfo.incorrectAnswers = decodedIncorrectAnswers();
            questionInfo.allAnswers = trivia_question_1.allAnswers(questionInfo);
            questionInfo.randomisedAnswers = trivia_question_1.randomisedOrder(questionInfo);
            this.currentQuestion = questionInfo;
            var messageToPost = this.questionMessage(questionInfo.question);
            if (questionInfo.type == "boolean") {
                messageToPost += this.trueOrFalseMessage();
            }
            if (questionInfo.type == "multiple") {
                var multichoiceClues = "";
                trivia_question_1.randomisedOrder(questionInfo).forEach((answer) => {
                    multichoiceClues += `${answer} \n`;
                });
                var mannyRedHerringMessage = `:hearts: :spades: :diamonds: :clubs:\n` +
                    `*Some clues or red herrings perhaps muahahahahha!!? xD*\n\n\n`;
                messageToPost += mannyRedHerringMessage;
                messageToPost += multichoiceClues;
            }
            message_handler_1.MessageHandler.postMessage(messageToPost);
        });
    }
    static checkUserAnswer(userId, userAnswer) {
        if (userAnswer.toLowerCase() ==
            this.currentQuestion.correctAnswer.toLowerCase()) {
            var points = this.getRandomPoints();
            //Check to see if user already on leaderboard
            var triviaRecord = this.triviaRecords.find((r) => r.userId == userId);
            //Make new record if not
            if (triviaRecord == null) {
                var newRecord = {
                    userId: userId,
                    shillingsAwarded: [],
                };
                newRecord.shillingsAwarded.push(points);
                this.triviaRecords.push(newRecord);
            }
            if (triviaRecord != null) {
                triviaRecord.shillingsAwarded.push(points);
            }
            message_handler_1.MessageHandler.postMessage(this.correctAnswerMessage(userId, points));
            this.savePointsFile();
            this.currentQuestion = null;
            return;
        }
        message_handler_1.MessageHandler.postMessage(this.incorrectAnswerMessage(userId));
        return;
    }
    static getPoints(userId) {
        var triviaRecord = this.triviaRecords.find((r) => r.userId == userId);
        if (triviaRecord == null || trivia_record_1.totalPoints(triviaRecord) == 0) {
            message_handler_1.MessageHandler.postMessage(this.userNoPointsMessage(userId));
            return;
        }
        message_handler_1.MessageHandler.postMessage(this.userTotalPointsMessage(userId, trivia_record_1.totalPoints(triviaRecord)));
        return;
    }
    static savePointsFile() {
        fs.writeFile(`./${this.triviaRecordFileName}`, JSON.stringify(this.triviaRecords), (err) => {
            if (err) {
                console.error(err);
                return;
            }
            if (global_settings_1.GlobalSettings.verboseLogging == true) {
                console.log(`Trivia records saved to ${this.triviaRecordFileName}.`);
            }
        });
    }
    static loadPointsFile() {
        if (!fs.existsSync(`./${this.triviaRecordFileName}`)) {
            if (global_settings_1.GlobalSettings.verboseLogging == true) {
                console.log(`No ${this.triviaRecordFileName} to load.`);
            }
            return;
        }
        fs.readFile(`./${this.triviaRecordFileName}`, "utf8", (err, jsonString) => {
            if (err) {
                console.log(`Error opening ${this.triviaRecordFileName}`);
                return;
            }
            this.triviaRecords = JSON.parse(jsonString);
            if (global_settings_1.GlobalSettings.verboseLogging == true) {
                console.log(this.triviaRecords);
            }
        });
        return;
    }
}
exports.TriviaProvider = TriviaProvider;
TriviaProvider.triviaRecordFileName = "trivia.json";
TriviaProvider.triviaRecords = [];
//# sourceMappingURL=trivia-provider.js.map