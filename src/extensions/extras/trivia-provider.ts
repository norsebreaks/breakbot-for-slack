import axios from "axios";
import { totalPoints, TriviaRecord } from "../../models/trivia-record";
import he from "he";
import { GlobalSettings } from "../global-settings";
import {
  allAnswers,
  randomisedOrder,
  TriviaQuestion,
} from "../../models/trivia-question";
import { MessageHandler } from "../message-handler";
import * as fs from "fs";

export class TriviaProvider {
  private static triviaRecordFileName: string = "trivia.json";
  private static triviaRecords: TriviaRecord[] = [];
  static currentQuestion: TriviaQuestion;
  static triviaActive(): boolean {
    if (this.currentQuestion != null) {
      return true;
    }
    return false;
  }
  //Messages/Responses
  private static questionMessage(triviaQuestion: string): string {
    return (
      `:hearts: :spades: :diamonds: :clubs: \n` +
      `*Breakbot Trivia Time!*\n\n` +
      `${triviaQuestion}\n\n\n\n\n`
    );
  }
  private static trueOrFalseMessage(): string {
    return `*True or False???*\n` + `:hearts: :spades: :diamonds: :clubs:`;
  }
  private static incorrectAnswerMessage(userId: string) {
    return `Sorry *<@${userId}>*, wrong answer.`;
  }
  private static correctAnswerMessage(userId: string, pointsAssigned: number) {
    return (
      `Hooray!!! *<@${userId}>* got the correct answer of *${this.currentQuestion.correctAnswer}*\n` +
      `:hearts: :spades: :diamonds: :clubs:\n\n` +
      `You get *${pointsAssigned}* ${GlobalSettings.triviaPointName}s! - Don't spend them all at once!`
    );
  }
  private static userTotalPointsMessage(
    userId: string,
    points: number
  ): string {
    return `*<@${userId}>*, you currently have *${points}* ${GlobalSettings.triviaPointName}s!`;
  }
  private static userNoPointsMessage(userId: string) {
    return `*<@${userId}>*, you don't currently have ANY ${GlobalSettings.triviaPointName}s! \n Answer some trivia to earn some!`;
  }
  //Trivia logic
  private static getRandomPoints(): number {
    var min = Math.ceil(1);
    var max = Math.floor(100);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
  }
  static postQuestionToChannel() {
    axios.get("https://opentdb.com/api.php?amount=1").then((res) => {
      if (GlobalSettings.verboseLogging) {
        console.log(res.data.results[0]);
      }
      var results: any = res.data.results[0];
      var questionInfo: TriviaQuestion = {
        category: results.category,
        type: results.type,
        difficulty: results.difficulty,
        question: he.decode(results.question),
        correctAnswer: he.decode(results.correct_answer),
      };
      function decodedIncorrectAnswers(): string[] {
        var answers: string[] = [];
        results.incorrect_answers.forEach((answer) => {
          answers.push(he.decode(answer));
        });
        return answers;
      }
      questionInfo.incorrectAnswers = decodedIncorrectAnswers();
      questionInfo.allAnswers = allAnswers(questionInfo);
      questionInfo.randomisedAnswers = randomisedOrder(questionInfo);

      this.currentQuestion = questionInfo;

      var messageToPost = this.questionMessage(questionInfo.question);
      if (questionInfo.type == "boolean") {
        messageToPost += this.trueOrFalseMessage();
      }
      if (questionInfo.type == "multiple") {
        var multichoiceClues: string = "";
        randomisedOrder(questionInfo).forEach((answer) => {
          multichoiceClues += `${answer} \n`;
        });
        var mannyRedHerringMessage: string =
          `:hearts: :spades: :diamonds: :clubs:\n` +
          `*Some clues or red herrings perhaps muahahahahha!!? xD*\n\n\n`;
        messageToPost += mannyRedHerringMessage;
        messageToPost += multichoiceClues;
      }

      MessageHandler.postMessage(messageToPost);
    });
  }
  static checkUserAnswer(userId: string, userAnswer: string) {
    if (
      userAnswer.toLowerCase() ==
      this.currentQuestion.correctAnswer.toLowerCase()
    ) {
      var points = this.getRandomPoints();
      //Check to see if user already on leaderboard
      var triviaRecord = this.triviaRecords.find((r) => r.userId == userId);
      //Make new record if not
      if (triviaRecord == null) {
        var newRecord: TriviaRecord = {
          userId: userId,
          shillingsAwarded: [],
        };
        newRecord.shillingsAwarded.push(points);
        newRecord.total = totalPoints(newRecord);
        this.triviaRecords.push(newRecord);
      }
      if (triviaRecord != null) {
        triviaRecord.shillingsAwarded.push(points);
        triviaRecord.total = totalPoints(triviaRecord);
      }
      MessageHandler.postMessage(this.correctAnswerMessage(userId, points));
      this.savePointsFile();
      this.currentQuestion = null;
      return;
    }

    MessageHandler.postMessage(this.incorrectAnswerMessage(userId));
    return;
  }
  static getPoints(userId: string) {
    var triviaRecord = this.triviaRecords.find((r) => r.userId == userId);
    if (triviaRecord == null || totalPoints(triviaRecord) == 0) {
      MessageHandler.postMessage(this.userNoPointsMessage(userId));
      return;
    }
    MessageHandler.postMessage(
      this.userTotalPointsMessage(userId, totalPoints(triviaRecord))
    );
    return;
  }
  static savePointsFile() {
    fs.writeFile(
      `./${this.triviaRecordFileName}`,
      JSON.stringify(this.triviaRecords),
      (err) => {
        if (err) {
          console.error(err);
          return;
        }
        if (GlobalSettings.verboseLogging == true) {
          console.log(`Trivia records saved to ${this.triviaRecordFileName}.`);
        }
      }
    );
  }
  static loadPointsFile() {
    if (!fs.existsSync(`./${this.triviaRecordFileName}`)) {
      if (GlobalSettings.verboseLogging == true) {
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
      if (GlobalSettings.verboseLogging == true) {
        console.log(this.triviaRecords);
      }
    });
    return;
  }
}
