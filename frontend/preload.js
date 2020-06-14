window.addEventListener('DOMContentLoaded', () => {

  var socket;
  ConnectToBackend();

  // gets all the calulater buttons 
  // adds click listener on each one
  // prints the value of the button to calc screen 
  var elements = document.querySelectorAll('.calculator span');
  elements.forEach(element => {
    element.addEventListener('click', function () {
      onCalcButtonPressed(this.innerText);
    });
  });

  // prints the value of the button on the screen 
  // sends the equation to the backend when equal button pressed
  // clears the text
  function onCalcButtonPressed(calcBtnValue) {
    var calcScreen = document.querySelector('.value');

    // adding the value to the sceen
    // validate if + is pressed twice
    // validate if last char is number 
    if (calcBtnValue != '=' && calcBtnValue != 'C') {
      if (calcScreen.value.length == 0 && calcBtnValue == "+") {
           alert("Number is expected")
        return
      } else if (calcBtnValue == "+" && calcScreen.value.length > 0 && calcScreen.value.slice(-1) == "+") {
           alert("Number is expected")
        return
      } else if (calcBtnValue === '-' | calcBtnValue === '*' | calcBtnValue === '/') {
        alert("This opreator will be available in next version")
        return
      }
       calcScreen.value += calcBtnValue;
    }
  
    // validate and send equation to backend
    if (calcBtnValue === '=') {
     if(isEquationCorrect()){
      socket.send(JSON.stringify({
        payload: calcScreenValuToArray(calcScreen.value)
      }));
     } 
    } else if (calcBtnValue === 'C') {
      calcScreen.value = "";
     }
  }

  // validate the input from the screen
  function isEquationCorrect(){
    var calcScreen = document.querySelector('.value');
    if (!calcScreen.value.includes("+")) {
      return false;
    }
    else if (calcScreen.value.slice(-1) == "+") {
      alert("one more number is missing");
      return false;
    } else if (calcScreen.value.length == 0) {
      alert("no equation to calculate");
      return false;
    }
    return true;
  }

  // split the equation to array of opreaters and numbers
  function calcScreenValuToArray(calcValues) {
    var expression = calcValues;
    var copy = expression;
    expression = expression.replace(/[0-9]+/g, "#").replace(/[\(|\|\.)]/g, "");
    var numbers = copy.split(/[^0-9\.]+/);
    var operators = expression.split("#").filter(function (n) { return n });
    var result = [];
    for (i = 0; i < numbers.length; i++) {
      result.push(numbers[i]);
      if (i < operators.length) result.push(operators[i]);
    }
    return result;
  }

  // connects to golang websocket
  function ConnectToBackend() {
    socket = new WebSocket("ws://localhost:8080/ws");
    console.log("Attepmting to connect to websocket");
    socket.onopen = () => {
      console.log("Successfully Connected");
    }

    socket.onclose = (event) => {
      console.log("Socket Closed Connection", event);
    }

    socket.onmessage = (msg) => {
      console.log(msg.data);
      SetResultFromBackend(msg.data);
    }
    socket.onerror = (event) => {
      console.log("Socket Error", event);
    }
  }

  // set the result which came from backend
  function SetResultFromBackend(result) {
    var element = document.querySelector('.value');
    element.value = result;
  }



})
