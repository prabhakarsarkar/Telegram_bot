const telegram = require("node-telegram-bot-api");
const token = "1379838680:AAEXAE5pt6O4MC_4b1DzYGAZVbzO6tbkQfE"
const axios = require("axios")
const Telegram = new telegram(token, {
    polling: true,
})

let questionBank = require("./qusetion/question");
let userData = [
    { chatId: "", quesData: [], index: "", resultQuiz: "", timeOut: "" },
]
// let correct= 0
// let inCorrect =0
let quesInQuiz = 6;
let totalQues =5


function postData(chatId,name, right, wrong) {
    axios.post("https://script.google.com/macros/s/AKfycbw3FEcq2QvgsDOYBUxVvBztr6IuU5ipYOI4zOn_nljyAbF2rU1e/exec?typeOfRequest=addData",
  
      {
        "ChatID": chatId,
        "name":name,
        "date": new Date().toLocaleString(),
        "RightAnswer": right,
        "wrongAnswer": wrong
      })
      .then((res) => {
        console.log("ok");
      }).catch(() => {
        console.log("err");
      })
  }



function randomQues() {
    let quesDataLength = questionBank.length;
    let randomQues = [];
    let quesdataCopy = [...questionBank];
    let n = quesDataLength;
    for (j = 0; j < quesInQuiz; j++) {
        let i = Math.floor(Math.random() * n);
        randomQues.push(quesdataCopy[i]);
        n -= 1;
        quesdataCopy.splice(i, 1);
    }
    return randomQues;
}

Telegram.onText(/\/(.+)/, (msg, match) => {
    index = 0;
    resultQuiz = { correct: 0, inCorrect: 0 };
    const chatId = msg.chat.id;
    console.log(chatId, match[1]);
    if (match[1] == "startQuiz") {
        let ind = userData.findIndex((u) => u.chatId === chatId);
        console.log("FRIST");
        // let quesData = randomQues();
        let userQuesData = randomQues();
        quesData = userQuesData;
        
        if (ind > -1) {
        userData[ind].resultQuiz.inCorrect=0;
        userData[ind].resultQuiz.correct=0;
        let userQuesData = randomQues();
        userData[ind]={
            chatId: chatId,
            quesData: userQuesData,
            index: 0,
            resultQuiz: { correct: 0, inCorrect: 0 },
        }
            
            Telegram.sendMessage(chatId, `Total Question in Quiz  ${ totalQues}  \n\n ${userData[userData.length - 1].quesData[userData[userData.length - 1].index].ques}`,

                {
                   "reply_markup": {
                        "keyboard":
                            userData[userData.length - 1].quesData[
                                userData[userData.length - 1].index
                            ].opt,
                       
                    },
                }

            )

        } else {
            
            userData.push({
                chatId: chatId,
                quesData: quesData,
                index: 0,
                resultQuiz: { correct: 0, inCorrect: 0 },
            });
            Telegram.sendMessage(chatId, `Total Question in Quiz  ${ totalQues}  \n\n ${userData[userData.length - 1].quesData[userData[userData.length - 1].index].ques}`,

                {
                   "reply_markup": {
                        "keyboard":
                            userData[userData.length - 1].quesData[
                                userData[userData.length - 1].index
                            ].opt,
                       
                    },
                }

            )


        }

    }

})


Telegram.on("text", async (message) => {
    const chatId = await message.chat.id;
    let ind = userData.findIndex((u) => u.chatId === chatId);
    let eq = message.text;
    if (ind === -1 && eq === "/startQuiz") {
        return;
    }

    if (ind > -1) {
        if (eq === "/startQuiz") {
            userData[ind].index = 0;
            console.log("ok");
        } else if (userData[ind].index < totalQues) {
            let ans = userData[ind].quesData[userData[ind].index].ans
            if (eq == ans) {
                userData[ind].resultQuiz.correct += 1;
                // console.log(chatId, "\n\n", message.from.first_name, "right", correct);
                result = "Your answer was correct";
                Telegram.sendMessage(chatId, result, {
                    // parse_mode: "HTML",
                });
            } else {
                 userData[ind].resultQuiz.inCorrect += 1;
                // console.log(chatId, "\n\n", message.from.first_name + " wrong ", inCorrect);
                result = "Your answer was wrong";
                Telegram.sendMessage(chatId, result,
                  {
                    // parse_mode: "HTML",
                  });
            } if (userData[ind].index < quesInQuiz - 1) {
                setTimeout(()=>{
                 userData[ind].index += 1;
                console.log("if");
                Telegram.sendMessage(chatId, `next question \n\n Total Question in Quiz  ${ totalQues}  \n\n ${userData[userData.length - 1].quesData[userData[userData.length - 1].index].ques}`
                    ,
                    {
                      
                      "reply_markup": {
                        "keyboard": userData[ind].quesData[userData[ind].index].opt,
                        
                      },
                    },10000)
                    }
                  );
            } else {
               return Telegram.sendMessage(chatId,`your game is finsh\n\ntotal question is    ${ totalQues} \n\n your total corrct answer is   ${correct} \n\n your total wrong answer is  ${inCorrect}`)
                

            }
        }else{
            postData(chatId,message.from.first_name,userData[ind].resultQuiz.correct,userData[ind].resultQuiz.inCorrect)
            
            return Telegram.sendMessage(chatId,`your game is finsh\n\ntotal question is    ${ totalQues} \n\n your total corrct answer is 
              ${userData[ind].resultQuiz.correct} \n\n your total wrong answer is  ${userData[ind].resultQuiz.inCorrect} \n\n\n if you want to agian press /startQuiz`)

        }

    } else {
        Telegram.sendMessage(chatId, "do you want to play this quiz_game so press /startQuiz")
    }

})


