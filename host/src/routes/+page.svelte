<script>
  let inputField = ''
  let hostId = 808
  let joincode;

  function createLobby() {
    const nowDate = (new Date()).toISOString()
    const lobby = {
      hostid: hostId,
      joincode: null,
      group: inputField,
      prompts: [],
      participants: [],
      datetime: nowDate,
      duration: 0,
      status: 0
    }

    fetch(
      'http://localhost:5313/createlobby',
     {
      method: "POST", 
      body: JSON.stringify(lobby),
      headers: {
        'Content-Type': 'application/json'
      }
    }
    )
    .then( response => {
      if (!response.ok) {
        throw new Error(`There was an error: ${response.status}`)
      }
      return response.json() 
    })
    .then(data => {
      joincode = data.joincode
      console.log(joincode)
    })
    //When the Lobby is created on the backend, the client calls this function
    .then(() => {
      webSocketCom()
    })
    .catch( error => {
      console.error(`There was a problem: ${error}`)
    })

    async function webSocketCom() {
      const socket = new WebSocket("ws://localhost:5313")

      socket.addEventListener('open', (event) => {
        socket.send(`Hi! Im: ${inputField}`)
      })
      socket.addEventListener('message', (event) => {
        console.log("message from server: ", JSON.parse(event.data))
      })




    }
  }
</script>

<div class="w-screen h-screen bg-slate-200 flex items-center justify-center">
  <div class="p-8 bg-slate-300">
    <p class="text-4xl">Host Controls</p>
    <input type="text" bind:value={inputField}>
    <br>
    <button on:click={createLobby} class="bg-gray-400">Submit</button>
  </div>
</div>