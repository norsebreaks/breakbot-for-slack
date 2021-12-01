const SlackBot = require('slackbots');
const axios = require('axios');
const moment = require('moment');
var express = require("express");
var fs = require('fs');
var he = require('he');

var app = express();
breakbot_port = 3000;

startServer();

app.get("/url", (req, res, next) => {
  res.json(["Tony", "Lisa", "Michael", "Ginger", "Food"]);
});
app.use(express.static("public"));
app.get("/", function(req, res){
  res.send("<h1>Catooomba</h1>")
});

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
// initialize the bot
const bot = new SlackBot({
  token: process.env.SLACK_TOKEN,
  name: process.env.DISPLAY_NAME || bbName()
});

// constant for bot icon in chat
const params = {
  icon_emoji: ':breakbot:'
}
function bbName(){
  currentDate = new Date();
  if(currentDate.getDay() == 1)
    return 'Máni';
  if(currentDate.getDay() == 2)
    return 'Týr';
  if(currentDate.getDay() == 3)
    return 'Óðinn';
  if(currentDate.getDay() == 4)
    return 'Þórr';
  if(currentDate.getDay() == 5)
    return 'Frigg';
  if(currentDate.getDay() == 6)
    return 'Ymir';
  else
    return 'BreakBot';
}

// initialize the master list of users from slack
slack_user_list = '';
activeSlackUsers = '';
axios.get(`https://slack.com/api/users.list?token=${bot.token}&pretty=1`)
  .then(res => {

    slack_user_list = res.data.members;
    activeSlackUsers = slack_user_list.filter(function (user) { return user.deleted != true; });
  });
bot.on('start', () => {
  currentdate = new Date();
  date_string = "Last Sync: " + currentdate.getDate() + "/" + (currentdate.getMonth() + 1 )
    + "/" + currentdate.getFullYear() + " @ "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":" + currentdate.getSeconds();

  console.log(`${bot.name} IS LIVE YO. \n ${date_string}`);
});
bot.on('open', () => {
  currentDate = new Date();
  console.log(currentDate.getDay());
})

// Error Handler
bot.on('error', (err) => console.log(err));
// Message Handler
bot.on('message', (data) => {
  // Ignores the message under these conditions
  // it is not a message
  // Slack userlist hasn't been downloaded yet
  // also ignore if the message is from this bot itself    
  if (data.type !== 'message' || !slack_user_list || data.subtype == 'bot_message') {
    return;
  };
  handleMessage(data);
});

// Response to incoming message data
function handleMessage(data) {
  if (!data.text) {
    return
  }
  if (data.text) {
    console.log(`${data.user}^${convert_id_to_realname(data.user)}^${data.text}`);
  }
  if (data.text.toLowerCase().includes('$bb manual')) {
    if (data.text.toLowerCase().includes('break')) {
      var str = data.text.toLowerCase();
      var user = str.substring(
        str.lastIndexOf("^") + 1,
        str.lastIndexOf(";")
      ).toUpperCase();
      bookBreak(user, 'break');
      return;
    }
    if (data.text.toLowerCase().includes('lunch')) {
      var str = data.text.toLowerCase();
      var user = str.substring(
        str.lastIndexOf("^") + 1,
        str.lastIndexOf(";")
      ).toUpperCase();
      bookBreak(user, 'lunch');
      return;
    }
    if (data.text.toLowerCase().includes('training')) {
      var str = data.text.toLowerCase();
      var user = str.substring(
        str.lastIndexOf("^") + 1,
        str.lastIndexOf(";")).toUpperCase();
      bookBreak(user, 'training');
      return;
    }
    if (data.text.toLowerCase().include('cancel')) {

    }
  }
  else if (data.text.toLowerCase().includes('$bb chucknorris')) {
    chuckJoke();
  } 
  else if (data.text.toLowerCase().includes('$bb dadjoke')) {
    dadJoke();
  } 
  else if (data.text.toLowerCase().includes('$bb lunch')) {
    bookBreak(data.user, 'lunch');
  } 
  else if (data.text.toLowerCase().includes('$bb cancel')) {
    user_cancels_break(data.user);
  }
  else if (data.text.toLowerCase().includes(':robot_face:')) {
    postMessageToBreakRoom(`:heartbeat:`);
  }
  else if (data.text.toLowerCase().includes('kitomba')) {
    postMessageToBreakRoom(`:k::k-i::k-t::k-o::k-m::k-b::k-a:`);
  }
  else if (data.text.toLowerCase().includes('dog')) {
    postMessageToBreakRoom(`:doge:`);
  }
  else if (data.text.toLowerCase().includes('russia') || data.text.toLowerCase().includes(':ru:') || data.text.toLowerCase().includes('blyat')) {
    postMessageToBreakRoom('Матушка Россия передает привет, товарищ.');
  }
  else if (data.text.toLowerCase().includes('$bb long')) {
    bookBreak(data.user, 'long');
  } 
  else if (data.text.toLowerCase().includes('$bb break')) {
    bookBreak(data.user, 'break');
  } 
  else if (data.text.toLowerCase().includes('$bb training')) {
    bookBreak(data.user, 'training');
  } 
  else if (data.text.toLowerCase().includes('$bb info')) {
    who_is_on_break();
  } 
  else if (data.text.toLowerCase().includes('$bb ?')) {
    helpMe();
  } 
  else if (data.text.toLowerCase().includes('$bb trivia')) {
    trivia();
  } 
  else if (data.text.toLowerCase().includes('$bb hurtmedaddy')) {
    hurt_me_daddy(data.user);
  }
  else if (data.text.toLowerCase().includes('$bb ron')) {
    post_ron();
  }
  else if (data.text.toLowerCase().includes('$bb refresh')) {
    read_breaks_from_file_on_startup();
  }
  else if (data.text.toLowerCase().includes('$bb shillings')) {
    load_shillings(data);
  }
  else if (data.text.toLowerCase().includes('$bb clear shillings')) {
    clear_shillings(data);
    postMessageToBreakRoom(`You now have 0 shillings, *<@${data.user}>*.`);
  }
  else if (data.text.toLowerCase().includes('$bb meme')) {
    get_meme();
  }
  else if (current_answer_to_trivia) {
    if (data.text.toLowerCase().includes(current_answer_to_trivia.toLowerCase())) {
      points_assigned = get_random_trivia_points()
      postMessageToBreakRoom(`Hooray!!! *<@${data.user}>* got the correct answer of *${current_answer_to_trivia}*\n` +
        `:hearts: :spades: :diamonds: :clubs:\n\n` +
        `You get *${points_assigned}* Somali shillings! - Don't spend them all at once!`
      )
      update_shillings(data, points_assigned);
      current_answer_to_trivia = ''
    }
  }
}


// CANCEL break
function user_cancels_break(userID) {
  // ESY WAY TO GET A USER_REAL_NAME  
  user_cancels_break_msg = `No worries *<@${userID}>*, welcome back! :no_mouth:`;
  user_not_on_break_msg = `You're not on break *<@${userID}>*, ya doofus! :no_mouth:`;
  // quick check to see if list is empty 
  if (current_staff_on_break.length > 0) {
    // since list isn't empty - check if this user is actually on the list 
    for (i = 0; i < current_staff_on_break.length; i++) {
      if (current_staff_on_break[i].userID == userID) {
        save_breaks_to_file_old();
        current_staff_on_break.splice(i, 1);
        postMessageToBreakRoom(user_cancels_break_msg);
        // save breaks to persistent file
        save_breaks_to_file()
        return;
      }
    }
    // user isn't in list, tell them off
    postMessageToBreakRoom(user_not_on_break_msg);
  } else {  // user can't be on a break since the current breaklist is empty duhh.        
    postMessageToBreakRoom(user_not_on_break_msg);
  }
}

// call datetime now  see if any current staff in breaklist should be removed due to their breaktime being over
function remove_staff_from_list_when_break_finished(userID, break_length_in_minutes) {
  break_length_in_ms = break_length_in_minutes * 60 * 1000
  // the magical function to remove users from list
  sleep(break_length_in_ms).then(() => {
    for (i = 0; i < current_staff_on_break.length; i++) {
      if (current_staff_on_break[i].userID == userID) {
        // post to chat to let the crew know
        user_back_from_break_msg = `*<@${userID}>* is back from ${current_staff_on_break[i].breakType}! :robot_face:`
        current_staff_on_break.splice(i, 1)

        // save updated breaklist to persistent file after cancelling
        save_breaks_to_file()
        postMessageToBreakRoom(user_back_from_break_msg);
      }
    }
  })
}
//write up the help response to question mark
function helpMe() {
  help_msg = '- *this help screen*' +
    '\n       `$bb ?`' +
    '\n- *see who is currently on break*' +
    '\n       `$bb info`' +
    '\n- *take a break*' +
    '\n       `$bb long`  for taking a cheeky 45er' +
    '\n       `$bb lunch` for taking a 30 minute break' +
    '\n       `$bb break` for taking a 15 minute break' +
    '\n       `$bb training` for taking a 60 minute training session' +
    '\n       `$bb cancel` to cancel your break`' +
    '\n- *random stuff*' +
    '\n       `$bb trivia`' +
    '\n       `$bb shillings` to see how many somali shillings are in yo bank' +
    '\n       `$bb meme`' +
    '\n       `$bb ron` for wisdom from the man himself' +
    '\n       `$bb dadjoke`'

    '\n :robot_face:  :robot_face:  :robot_face:'

  postMessageToBreakRoom(help_msg);
}
// tell a dumb Chuck norris joke
function chuckJoke() {
  axios.get('http://api.icndb.com/jokes/random')
    .then(res => {
      const joke_html = res.data.value.joke;

      // translate joke from html
      joke = he.decode(joke_html)
      // post joke to chat
      postMessageToBreakRoom(`${joke}`)
    })
    .catch(error => {
      console.log("Yikes error trying to get Chuck norris joke below");
      console.log(error);
      postMessageToBreakRoom(`Yikes sorry Chuck Norris API is down atm :(`);
    })
}
// tell a dumb Dadjoke
function dadJoke() {
  axios.get('https://us-central1-dadsofunny.cloudfunctions.net/DadJokes/random/jokes')
    .then(res => {
      const setup = res.data.setup;
      const punchline = res.data.punchline;
      // post joke to chat
      postMessageToBreakRoom(`${setup} \r ${punchline}`);
    })
    .catch(error => {
      console.log("Yikes error trying to get dadjoke below");
      console.log(error);
      postMessageToBreakRoom(`Yikes sorry dadjokes API is down atm :(`)
    })
}

function get_meme() {
  axios.get('https://meme-api.herokuapp.com/gimme')
    .then(res => {
      const img = res.data.url;
      postMessageToBreakRoom(img);
    })
}
function post_ron() {
  axios.get('https://ron-swanson-quotes.herokuapp.com/v2/quotes')
    .then(res => {
      const ronQuote = res.data;
      postMessageToBreakRoom(`${ronQuote[0]} \r - Ron Swanson`);
    })
}

// get a random elizabethan insult
function hurt_me_daddy(userID) {
  // change icon to lit emoji
  const params = {
    icon_emoji: ':fire:'
  }

  // get a random elizabethan insult
  axios.get('http://quandyfactory.com/insult/json')
    .then(res => {
      console.log(res.data.insult);
      // post insult to chat
      postMessageToBreakRoom(`*<@${userID}>*, ${res.data.insult.toLowerCase()}` + `:fire:`)
    })
    .catch(error => {
      console.log("The insult API is down so I shall be nice today <3");
      console.log(error);
    });
}



// current answer to trivia variable
current_answer_to_trivia = '';
current_trivia_res = null;
// TRIVIA bot
function trivia() {
  axios.get('https://opentdb.com/api.php?amount=1')
    .then(res => {
      trivia_question = he.decode(res.data.results[0].question)

      // FIXME: get rid of this console.log
      current_answer_to_trivia = he.decode(res.data.results[0].correct_answer)
      console.log('current answer to trivia is ' + current_answer_to_trivia)

      current_trivia_res = res.data.results[0];

      // post trivia question to chat
      question_string = `:hearts: :spades: :diamonds: :clubs: \n` +
        `*Breakbot Trivia Time!*\n\n` +
        `${trivia_question}\n\n\n\n\n`



      // set the current answer to trivia variable outside of function 



      // if trivia question is a boolean choice - post a message saying it is true or false
      if (current_trivia_res.type == 'boolean') {
        true_or_false_string = `*True or False???*\n` + `:hearts: :spades: :diamonds: :clubs:`
        postMessageToBreakRoom(question_string + true_or_false_string)
      } else if (current_trivia_res.type == 'multiple') {

        unrandom_list_of_all_answers = [he.decode(res.data.results[0].correct_answer)]

        // post  clues to chat        
        for (i = 0; i < current_trivia_res.incorrect_answers.length; i++) {

          // add all the incorrect answers to the unrandom list of all answers 
          current_incorrect_answer = he.decode(current_trivia_res.incorrect_answers[i])
          unrandom_list_of_all_answers.push(current_incorrect_answer)

        }

        // test console log - should be all the answers in here
        // console.log('Unrandom list is')
        // console.log(unrandom_list_of_all_answers)
        random_list_of_all_answers = shuffle_trivia_answers_list(unrandom_list_of_all_answers)

        // console.log('Random list is')        
        // console.log(random_list_of_all_answers)

        string_of_clues = ''
        // post  clues to chat        
        for (i = 0; i < random_list_of_all_answers.length; i++) {
          // create a clue string that is formatted and send to chat
          string_of_clues = string_of_clues + `${random_list_of_all_answers[i]}\n`
        }

        red_herring_string = `:hearts: :spades: :diamonds: :clubs:\n` + `*Some clues or red herrings perhaps muahahahahha!!? xD*\n\n\n`
        postMessageToBreakRoom(question_string + red_herring_string + `${string_of_clues}`)
      }
    })
    .catch(error => {
      console.log("Yikes error trying to get trivia below");
      console.log(error);
      postMessageToBreakRoom(`Yikes sorry trivia API is down atm :(`)
    })
}

// function to assign trivia points
function get_random_trivia_points() {
  min = Math.ceil(1);
  max = Math.floor(100);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}

// randomize the trivia answer list
function shuffle_trivia_answers_list(arra1) {
  let ctr = arra1.length;
  let temp;
  let index;

  // While there are elements in the array
  while (ctr > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * ctr);
    // Decrease ctr by 1
    ctr--;
    // And swap the last element with it
    temp = arra1[ctr];
    arra1[ctr] = arra1[index];
    arra1[index] = temp;
  }
  return arra1;
}

// Info function to see who is on break
function who_is_on_break() {
  if (current_staff_on_break.length == 0) {
    status = "*No-one* is on break at the moment :upside_down_face:"
  } else if (current_staff_on_break.length == 1) {
    status = `There is *one* person away on at the moment - maybe you should join them *peow peow* :smirk:
      *${current_staff_on_break[0].user_real_name}* is back at *${current_staff_on_break[0].due_time_string}* currently at *${current_staff_on_break[0].breakType}*`
  } else if (current_staff_on_break.length == 2) {
    status = `There are *two* people away at the moment :sob:
      *${current_staff_on_break[0].user_real_name}* is back at *${current_staff_on_break[0].due_time_string}* currently at *${current_staff_on_break[0].breakType}*
      *${current_staff_on_break[1].user_real_name}* is back at *${current_staff_on_break[1].due_time_string}* currently at *${current_staff_on_break[1].breakType}*`
  }
  // post status to chat
  postMessageToBreakRoom(status)
}
// return current_time_string, due_time_string, current_dateObject and due_dateObject
// thankyou momentJS yet again <3
function get_current_time_and_due_time(userID, breakType, user_real_name) {
  current_dateObject = new Date();
  if (breakType == 'long') {
    break_length_in_minutes = 45 //FIXME: 45
    due_dateObject = moment(current_dateObject).add(break_length_in_minutes, 'm').toDate();
  }
  else if (breakType == 'lunch') {
    break_length_in_minutes = 30 //FIXME: 30
    due_dateObject = moment(current_dateObject).add(break_length_in_minutes, 'm').toDate();
  }
  else if (breakType == 'break') {
    break_length_in_minutes = 15 // FIXME: 15
    due_dateObject = moment(current_dateObject).add(break_length_in_minutes, 'm').toDate();
  }
  else if (breakType == 'training') {
    break_length_in_minutes = 60 //FIXME: 60
    due_dateObject = moment(current_dateObject).add(break_length_in_minutes, 'm').toDate();
  }

  current_time_string = moment(current_dateObject).format('LT');
  due_time_string = moment(due_dateObject).format('LT');

  current_staff_on_break.push({
    userID: userID,
    user_real_name: user_real_name,
    breakType: breakType,
    current_time_string: current_time_string,
    due_time_string: due_time_string,
    due_dateObject: due_dateObject
  })
  // call timer function and then remove user from list when timer runs out
  remove_staff_from_list_when_break_finished(userID, break_length_in_minutes, user_real_name, breakType)

  // save breaks to persistent file
  save_breaks_to_file()
  return due_time_string
}
//constant for max users on break  //
const max_staff_on_break = 2;
// current_staff_on_break = [obama, angie] to test
current_staff_on_break = []
// load saved list of users
read_breaks_from_file_on_startup();





// simple test function to book a break - $ seems like a safe trigger for the bot
function bookBreak(userID, breakType) {
  user_real_name = convert_id_to_realname(userID);
  // check that current staff list isn't empty
  if (current_staff_on_break.length == 0) {
    save_breaks_to_file_old();
    add_user_to_break(userID, breakType, user_real_name)
  }
  else if (current_staff_on_break.length !== 0) {
    check_if_user_already_on_break(userID, breakType, user_real_name)
  }
}
// simple function to check if a user is already on a break
function check_if_user_already_on_break(userID, breakType, user_real_name) {
  arrayLength = current_staff_on_break.length;
  for (i = 0; i < arrayLength; i++) {
    if (current_staff_on_break[i].userID == userID) {
      user_already_on_break_msg = `*<@${userID}>*, you are *already* on ${current_staff_on_break[i].breakType} you silly billy! :robot_face:`
      postMessageToBreakRoom(user_already_on_break_msg)
      return;
    };
  }
  // if user isn't already in list add them
  save_breaks_to_file_old();
  add_user_to_break(userID, breakType, user_real_name)
}
// add a user to a break
function add_user_to_break(userID, breakType, user_real_name) {
  // checks if there are two people on a break - if there aren't it calls the date function and adds them to current_staff_on_break object
  if (current_staff_on_break.length < max_staff_on_break) {
    due_time = get_current_time_and_due_time(userID, breakType, user_real_name)
    let breakTypeEmoji = '';

    if (breakType == 'lunch') {
      breakTypeEmoji = ':hamburger:';
    }
    if (breakType == 'break') {
      breakTypeEmoji = ':fries:';
    }
    if (breakType == 'long') {
      breakTypeEmoji = ':bento:';
    }
    if (breakType == 'training') {
      breakTypeEmoji = ':book:';
    }


    postMessageToBreakRoom(
      `hello *<@${userID}>* you can go to ${breakType} now ${breakTypeEmoji}
      see you back at *${due_time}*`,
    );

  } else {
    //TODO: response when breaks are at max
    postMessageToBreakRoom(
      `I'm sorry *${user_real_name}*, there are already two people away :unamused:
            *${current_staff_on_break[0].user_real_name}* is back at *${current_staff_on_break[0].due_time_string}* currently at *${current_staff_on_break[0].breakType}*,
            *${current_staff_on_break[1].user_real_name}* is back at *${current_staff_on_break[1].due_time_string}* currently at *${current_staff_on_break[1].breakType}*.`
    );
  }
}
// convert userID to real name
function convert_id_to_realname(id) {
  for (i = 0; i < slack_user_list.length; i++) {
    if (id === slack_user_list[i].id) {
      return slack_user_list[i].real_name
    }
  }
}
// function to post message to channel
function postMessageToBreakRoom(msg) {
  msg = msg;
  //    tcpClient.write(`Bot posted^${msg}`);
  bot.postMessageToChannel(
    'breakroom',
    msg,
    params
  );
}

function save_breaks_to_file() {
  // write the current_staff_break list to
  fs.writeFile("./saved_list_of_staff_on_break.json", JSON.stringify(current_staff_on_break), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log("Saved list of staff on break to json file");
  });
}
function save_breaks_to_file_old() {
  // duplicate of above function, but called before making changes to the break list
  fs.writeFile("./saved_list_of_staff_on_break.json.old", JSON.stringify(current_staff_on_break), (err) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Saved backup list of staff on break.");
  });
}

function save_shillings_to_file(data, shillings) {
  fs.writeFile(`./${data.user}_shillings.json`, JSON.stringify(shillings), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log(`Saved${data.user}'s shillings.`);
  });
}
function load_shillings(data) {
  fs.readFile(`./${data.user}_shillings.json`, 'utf8', (err, jsonString) => {
    if (err) {
      console.log("No shillings found.");
      shilling_count = 0;
      postMessageToBreakRoom(`*<@${data.user}>*, you currently have *${shilling_count}* shillings!`);
      fs.writeFile(`./${data.user}_shillings.json`, JSON.stringify(shilling_count), (err) => {
        if (err) {
          console.error(err);
          return;
        };
        console.log(`Saved${data.user}'s shillings.`);
      });
      return;
    }
    shilling_count = JSON.parse(jsonString);
    console.log(shilling_count);
    postMessageToBreakRoom(`*<@${data.user}>*, you currently have *${shilling_count}* shillings!`);
    return;
  });
}

function update_shillings(data, new_shillings) {
  if (fs.existsSync(`./${data.user}_shillings.json`)) {
    fs.readFile(`./${data.user}_shillings.json`, 'utf8', (err, jsonString) => {
      if (err) {
        console.log("File read failed, making new:", err);
        save_shillings_to_file(data, new_shillings);
        return;
      }
      shillings = new_shillings + JSON.parse(jsonString);
      console.log(`New shillings: ${shillings}`);
      save_shillings_to_file(data, shillings);
      return;
    })
  }
  else {
    save_shillings_to_file(data, new_shillings);
  }
}

function clear_shillings(data) {
  if (fs.existsSync(`./${data.user}_shillings.json`)) {
    fs.readFile(`./${data.user}_shillings.json`, 'utf8', (err, jsonString) => {
      if (err) {
        console.log("File read failed, making new:", err);
        save_shillings_to_file(data, 0);
        return;
      }
      shillings = 0;
      console.log(`New shillings: ${shillings}`);
      save_shillings_to_file(data, 0);
      return;
    })
  }
  else {
    save_shillings_to_file(data, 0);
  }
}
// read saved json file
function read_breaks_from_file_on_startup() {
  fs.readFile('./saved_list_of_staff_on_break.json', 'utf8', (err, jsonString) => {

    if (err) {
      fs.writeFile("./saved_list_of_staff_on_break.json", JSON.stringify(current_staff_on_break), (err) => {
        if (err) {
          console.error(err);
          return;
        };
        console.log("Saved list of staff on break to json file");
      });
      return;
    }

    // parse the recovered json list
    recovered_break_list = JSON.parse(jsonString)

    temp_list_to_pass_to_current_staff_on_break = []

    // after loading recovered list 
    // the amount of time spent on this trying to splice the first list instead of just creating a new one is embarrasing ugh
    for (i = 0; i < recovered_break_list.length; i++) {
      current_time = moment()
      // - remove any users who's break endtime is in the past
      retrieved_date_already_expired = moment(recovered_break_list[i].due_dateObject).isBefore()

      if (retrieved_date_already_expired) {
        return
      } else {
        // TODO: for every valid break - calculate how many minutes until their break is over and call the timer function again        
        time_until_break_over = moment(recovered_break_list[i].due_dateObject).diff(current_time, 'minutes')
        // call timer function to auto remove users and also send message chat below
        remove_staff_from_list_when_break_finished(recovered_break_list[i].userID, time_until_break_over)
        temp_list_to_pass_to_current_staff_on_break.push(recovered_break_list[i])
      }

    }
    // update the current_staff_on_break list for when users check inside Slack
    current_staff_on_break = temp_list_to_pass_to_current_staff_on_break
  })

}
function loadConfigFile() {
  fs.readFile('./breakbot.config', 'utf8', (err, jsonString) => {
    if (err) {
      console.log("No config file found.");
      
      var defaultConfig = {
        port: 3000,
        token: '',
        name: 'BreakBot'
      }
      fs.writeFile('./breakbot.config', JSON.stringify(defaultConfig), (err) => {
        if (err) {
          console.log(err);
        }
        console.log("Created breakbot.config in root directory");
        console.log("Token, port and slack name can be set in the config if needed.");
      });
      breakbot_port = defaultConfig.port;
      bot.token = defaultConfig.token;
      bot.name = defaultConfig.name;
      return;
    }
    var config = JSON.parse(jsonString);
    breakbot_port = config.port;
    bot.token = config.token;
    bot.name = config.name;
    app.listen(process.env.PORT || breakbot_port, () => {
      console.log(`Server running on port ${breakbot_port}`);
    });
    console.log("Token, port and slack name can be set in the config if needed.");
    return;
  })
}
function startServer(){
  app.listen(process.env.PORT || breakbot_port, 
    () => console.log("Server is running..."));
}

