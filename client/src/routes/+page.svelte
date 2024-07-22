<script>
  let joincodeField = ''
  let nameField = ''

  function createLobby() {
  let bodyContent = {
    name: nameField,
    joincode: joincodeField
  }

  fetch(`http://localhost:5313/joinlobby${joincodeField}`, 
  {
      method: "POST", 
      body: JSON.stringify(bodyContent),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then( response => {
      if (!response.ok) {
        throw new Error(`There was an error: ${response.status}`)
      }
      return response
    })
    .then(() => {
      lobbyClientCom()
    })


    async function lobbyClientCom() {
      const source = new EventSource(`http://localhost:5313/lobbyclient${joincodeField}${nameField}`)
      source.addEventListener('message', message => {
        let response = JSON.parse(message.data)
        console.log(response.prompts)
      })
    }

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
      <button on:click={createLobby} class="bg-gray-400">Submit</button>
    </div>
    <div class="w-full pb-20 h-fit bg-red-200 flex">

    </div>
  </div>
</div>