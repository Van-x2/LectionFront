<script>
  import { onMount } from "svelte";
  let inputField = ''
  let hostId = 808
  let joincode;
  let participantsList
  let promptsList

onMount(() =>{
participantsList = document.getElementById('participants')
promptsList = document.getElementById('prompts')
})

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
      status: 1
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
    .then(() => {lobbyHostCom()})
    .catch( error => {
      console.error(`There was a problem: ${error}`)
    })

    async function lobbyHostCom() {
      console.log('passed')
      let route = `http://localhost:5313/lobbyhost${joincode}`
      const source = new EventSource(route)
      source.addEventListener('message', message => {
        let response = JSON.parse(message.data)
        console.log(response)
        console.log(response.prompts)
        refreshULPrompts(promptsList, response.prompts)
        refreshULPlayers(participantsList, response.participants)
        //refreshUL(promptsList, message.data.prompts)
      })
    }
  }

function refreshULPrompts(element, array) {
  element.textContent = ''
  for(let i = 0; i < array.length; i++) {
    let item = document.createElement('Li')
    item.appendChild(document.createTextNode(`- ${array[i]}`))
    element.appendChild(item)
  }
}
function refreshULPlayers(element, array) {
  element.textContent = ''
  for(let i = 0; i < array.length; i++) {
    let item = document.createElement('Li')
    item.appendChild(document.createTextNode(`- ${array[i].name}`))
    element.appendChild(item)
  }
}

</script>

<div class="w-screen h-screen bg-slate-200 flex items-center justify-center">
  <div>
    <div class="p-16 bg-slate-300">
      <p class="text-4xl">Host Controls</p>
      <input type="text" bind:value={inputField}>
      <br>
      <button on:click={createLobby} class="bg-gray-400">Submit</button>
    </div>
    <div class="w-full h-fit bg-slate-300 flex">
      <div class="w-[50%] h-fit pb-12 p-2 bg-lime-100">
        <ul id="prompts">
        </ul>
      </div>
      <div class="w-[50%] h-fit pb-12 p-2 bg-red-100">
        <ul id="participants">
        </ul>
      </div>
    </div>
  </div>
</div>
