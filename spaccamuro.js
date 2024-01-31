// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-1DTBZ8VK97');


// Caricamento Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function(
        registration) {
        console.log('Registration successful, scope is:',
            registration.scope)
    }).catch(function(error) {
        console.log(
            'Service worker registration failed, error:',
            error);
    })
}

// Codice di spaccamuro

let wakeLockObj = null
const audioDown = document.getElementById('audio-down')
const audioUp = document.getElementById('audio-up')
let players = 1
let player = 1
let muro = document.querySelector('#page1 .muro')
let mattoni = muro.querySelectorAll('.mattone')
let mattoniCaduti = muro.querySelectorAll('.mattone.caduto')
let mattoniDaButtare = mattoni.length - mattoniCaduti.length
let target = 1
let cambioInCorso = null
let mattoniButtati = 0


function noStandby() {
    if ("wakeLock" in navigator && wakeLockObj === null) {
        navigator.wakeLock.request("screen").then(function(wakeLock) {
            wakeLockObj = wakeLock;
        }).catch(function(err) {
            console.error(`${err.name}, ${err.message}`);
        });
    }
}


document.getElementById('player1').addEventListener('click', function() {
    document.getElementById('page1').style.display = 'block'
    document.getElementById('page2').style.display = 'none'
    document.querySelector('#page1 .muro').style.display = 'block'
    players = 1
    setTimeout(buttaSu, 1000)
})

document.getElementById('player2').addEventListener('click', function() {
    document.getElementById('page1').style.display = 'none'
    document.getElementById('page2').style.display = 'block'
    players = 2
    setTimeout(buttaSu, 1000)
})

document.querySelector('.stop').addEventListener('click', function() {
    players = 1
    finePartita()
})

function handleMotionEvent(event) {
    const z = event.accelerationIncludingGravity.z
    if (Math.abs(z) > 11) { // abs perché iOs è negativa, Android è positiva
        buttaGiu()
    }
}

// in iOS va richiesto il permesso
let permissionGranted = false

function getPermission () {
if (!permissionGranted) {
    DeviceMotionEvent.requestPermission()
        .then(response => {
            if (response == "granted") {
                window.addEventListener("devicemotion", handleMotionEvent, true)
            }
    })
}
}

// iPhone
if (typeof(DeviceMotionEvent) !== "undefined" && typeof(DeviceMotionEvent.requestPermission) === "function") {
    document.getElementById('player1').addEventListener('click', getPermission)
    document.getElementById('player2').addEventListener('click', getPermission)
} else {
// Android
    window.addEventListener("devicemotion", handleMotionEvent, true)
}





function cambiaGiocatore() {
    // Se ne ha buttati giù più di quanto richiesto, gli ricostruisco tanti mattoni quanti ne ha buttati giù in più
    const inPiu = mattoniButtati - target
    cambioInCorso = null

    if (inPiu > 0) {
        for (let i = 0; i < inPiu + mattoniButtati; i++) {
            const mattoniCaduti = muro.querySelectorAll('.mattone.caduto')
            if (mattoniCaduti.length) {
                mattoniCaduti[mattoniCaduti.length - 1].classList.remove('caduto')
                audioUp.play()
            }
        }
    }


    player = player == 1 ? 2 : 1
    mattoniButtati = 0
    muro = document.querySelector('.muro.player' + player)
    document.querySelectorAll('.muro').forEach(el => el.classList.remove('active'))
    muro.classList.add('active')
    mattoni = muro.querySelectorAll('.mattone')
    mattoniCaduti = muro.querySelectorAll('.mattone.caduto')
    mattoniDaButtare = mattoni.length - mattoniCaduti.length
    target = calculateTarget()
    muro.nextElementSibling.textContent = target
}

function buttaGiu() {
    mattoniDaButtare = muro.querySelectorAll('.mattone:not(.caduto)').length

    if (mattoniDaButtare > 0) {
        mattoni[mattoni.length - mattoniDaButtare].classList.add('caduto')
        audioDown.play()
        mattoniButtati++
        mattoniDaButtare--
    }

    // cambio giocatore (un secondo è il tempo per buttare giù uno o più mattoni)
    // se è in due e non è già in corso un cambio e non ha buttato giù tutti i mattoni
    // oppure li ha buttati giù tutti ma ne ha buttati giù più di quanti richiesti
    if (players == 2 && !cambioInCorso && (mattoniDaButtare > 0 || mattoniButtati > target)) {
        cambioInCorso = setTimeout(cambiaGiocatore, 1000)
    }

    if (mattoniDaButtare < 1 && (mattoniButtati <= target || players == 1)) {
        finePartita()
    }

}

function buttaSu() {
    noStandby()
    document.querySelectorAll('.muro').forEach(el => el.classList.remove('winner'))

    const tuttiMattoni = document.querySelectorAll('#page' + players + ' .mattone')
    Array.from(tuttiMattoni).forEach(el => el.classList.remove('caduto'))
    document.querySelector('.buttons').classList.add('fadeout')
    document.querySelector('.title').classList.add('fadeout')
    document.querySelector('.stop').classList.remove('fadeout')
    document.querySelector('#page2 .muro.player1').classList.remove('fadeout')
    document.querySelectorAll('#page2 .muro').forEach(el => el.classList.remove('winner'))
    document.querySelector('#page1 .muro').classList.remove('fadeout')

    if (players == 1) {
        muro = document.querySelector('#page1 .muro')
    } else {
        muro = document.querySelector('#page2 .muro.player1')
        muro.classList.add('active')
        target = calculateTarget()
        muro.nextElementSibling.textContent = target
        player = 1
    }
    mattoni = muro.querySelectorAll('.mattone')
    mattoniCaduti = muro.querySelectorAll('.mattone.caduto')
    mattoniDaButtare = mattoni.length - mattoniCaduti.length
    mattoniButtati = 0
}

function calculateTarget() {
    target = Math.floor(Math.random() * 3) + 1
    if (Math.random() < 0.03) { // 3% di probabilità di buttare giù 10 mattoni, 1/33
        target = 10
        document.querySelector('#audio-siren').play()
    }
    return target
}

function finePartita() {
    if (players == 1) {
        document.querySelector('#page1').style.display = 'block'
        document.querySelector('#page1 .muro').style.display = 'none'
        document.querySelector('#page2').style.display = 'none'
        document.querySelector('.title').classList.remove('fadeout')
    } else {
        document.querySelector('#page1').style.display = 'none'
        document.querySelector('#page2').style.display = 'block'
        document.querySelector('#page2 .muro.player' + player).classList.add('winner')
    }
    document.querySelector('.buttons').classList.remove('fadeout')
    document.querySelector('.stop').classList.add('fadeout')
    document.querySelectorAll('.muro').forEach(el => el.classList.remove('active'))
}

// Butto giù nel desktop con il tasto spazio
document.addEventListener('keyup', function(e) {
    if (e.key == ' ') {
        buttaGiu()
        e.preventDefault() // altrimenti il focus è sul bottone di inizio partita e lo clicca
    }
    if (e.key == 'Escape') {
        players = 1
        finePartita()
    }
})