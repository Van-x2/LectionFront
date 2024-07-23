<script>
  let joincodeField = ''
  let nameField = ''
  let currentprompt = 0
  let answerField = ''
  let confidenceValue = '3'



  function joinLobby() {
    
    //defines JSON data to be sent to backend
    let bodyContent = {
      name: nameField,
      joincode: joincodeField
    }
    //sends JSON data to the backend adding the client to the participants field
    fetch(`http://localhost:5313/joinlobby${joincodeField}`, 
  {
      method: "POST", 
      body: JSON.stringify(bodyContent),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    //error checking response
    .then( response => {
      if (!response.ok) {
        throw new Error(`There was an error: ${response.status}`)
      }
      return response
    })
    //begins SSE connection with lobbyClientCom()
    .then(() => {
      lobbyClientCom()
    })

    //Starts listening to SSE from the backend to update prompts
    async function lobbyClientCom() {
      const source = new EventSource(`http://localhost:5313/lobbyclient${joincodeField}${nameField}`)
      source.addEventListener('message', message => {
        let response = JSON.parse(message.data)
        console.log(response)
        if(response.status === 3) {
          source.close()
          leaveLobby()
        }
      })
    }

    async function submitClientResponse() {}
  }

  function leaveLobby() {
    console.log('left the lobby')
  }


  function submitResponse() {
    let asnwerContent = {
      response: answerField,
      confidence: confidenceValue,
      promptIndex: currentprompt
    }
  //submit asnwer to mongodb
    fetch(`http://localhost:5313/clientsubmitresponse${joincodeField}${nameField}`, 
  {
      method: "POST", 
      body: JSON.stringify(asnwerContent),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    //error checking response
    .then( response => {
      if (!response.ok) {
        throw new Error(`There was an error: ${response.status}`)
      }
      return response
    })
  }
</script>

<div class="w-screen h-screen bg-slate-200 flex items-center justify-center">
  <div>
    <div class="p-16 bg-slate-300">
      <p class="text-4xl">Player Controls</p>
      <input type="text" placeholder='joincode' bind:value={joincodeField}>
      <br>
      <input type="text" placeholder='name' bind:value={nameField}>
      <br>
      <input type="text" placeholder='response' bind:value={answerField}>
      <br>
      <span> how confident are you? 1 - 5 </span>
      <br>
      <input type="range" bind:value={confidenceValue} min="1" max="5">
      <br>
      <button on:click={joinLobby} class="bg-gray-400">Join</button>
      <button on:click={submitResponse} class="bg-gray-400">Submit Response</button>
    </div>
    <div class="w-full pb-20 h-fit bg-red-200 flex">

    </div>
  </div>
</div>

