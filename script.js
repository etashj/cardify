// TILT HOVER ON LOGIN BUTTON
const card = document.querySelector(".tilt-card");
const THRESHOLD = 40;

function handleHover(e) {
    const { clientX, clientY, currentTarget } = e;
    const { clientWidth, clientHeight, offsetLeft, offsetTop } = currentTarget;

    const horizontal = (clientX - offsetLeft) / clientWidth;
    const vertical = (clientY - offsetTop) / clientHeight;

    const rotateX = (THRESHOLD / 2 - horizontal * THRESHOLD).toFixed(2);
    const rotateY = (vertical * THRESHOLD - THRESHOLD / 2).toFixed(2);

    card.style.transform =`perspective(${clientWidth}px) rotateX(${rotateY}deg) rotateY(${rotateX}deg) scale3d(1, 1, 1)`;
}

function resetStyles(e) {
    card.style.transform = `perspective(${e.currentTarget.clientWidth}px) rotateX(0deg) rotateY(0deg)`;
}

card.addEventListener("mousemove", handleHover);
card.addEventListener("mouseleave", resetStyles);



// WINDOW ONLOAD AUTH CODE CHECK

var data; 

var cardCanvas = document.getElementById("card");
var context = cardCanvas.getContext('2d');
context.imageSmoothingEnabled = false;
var frontImg = new Image(); // Create new img element
frontImg.src = "images/blank-card-front.png";

var tiltCard = $(".tilt-card")[0];
var parent = tiltCard.parentNode; 
let loggedIn = false;

let cards = document.getElementById('int-container')
let parentCard = cards.parentNode; 

const loggedInHandler = {
  set(target, property, value) {
    // Code to run when the variable changes
    console.log(`${property} changed from ${target[property]} to ${value}`);
    let login = document.getElementById("login-button"); 
    let title = document.getElementById('title');
    let footer = document.getElementById('footer')
    console.log(value); 
    if (value) {
        //login.style.display = "none";
        title.style.fontSize = "2em";
        tiltCard.parentNode.removeChild(tiltCard);
        cards.style.display = "flex";
        footer.style.display = 'none'
        console.log('canvas drawing')
        drawCanvas(70)
        console.log('canvas drawn')
    } else {
        //login.style.display = "block";
        title.style.fontSize = "5em";
        parent.appendChild(tiltCard);
        cards.style.display = "none";
        footer.style.display = 'block'
    }
    target[property] = value;
    return true;
  }
};

const proxy = new Proxy({ loggedIn }, loggedInHandler);

window.onload = (event) => {
    
    console.log("page is fully loaded");

    let card = document.getElementById("card");
    let cardContainer = document.getElementById("card-container");

    var scaleFactor = 2

    card.width = 230 *scaleFactor;
    card.height = 142 *scaleFactor;
    
    //context.drawImage(frontImg, 0, 0);
    context.drawImage(frontImg, 0, 0, 230,    142,     // source rectangle
                   0, 0, card.width, card.height);

    let rightSide = document.getElementById("right-sidebar"); 
    let leftSide = document.getElementById("left-sidebar"); 
    if ((rightSide.offsetWidth <= 115 || leftSide.offsetWidth <= 115) && (rightSide.style.order != 5 || leftSide.style.order != 5)) {
        rightSide.style.order = 5;
        leftSide.style.order = 5;
        cardContainer.style.width = '100vw'; 
        leftSide.style.width = '46vw'; 
        rightSide.style.width = '46vw'; 
    } else {
        rightSide.style.order = 2;
        leftSide.style.order = 1;
        cardContainer.style.width = '50vw'; 
        leftSide.style.width = '20vw'; 
        rightSide.style.width = '20vw'; 
    }

    let authToken = localStorage.getItem('access_token')
    if (!(authToken)) {
        console.warn("Auth Token not Detected")
        proxy.loggedIn = false
    } else {
        console.log("Auth Code Detected")
        proxy.loggedIn = true

        getProfile().then((result) => {
            if (result) {
                console.log("Auth Code Valid")
                proxy.loggedIn = true
            } else {
                console.warn("Auth Token Expired")
                proxy.loggedIn = false

                const urlParams = new URLSearchParams(window.location.search);
                let code = urlParams.get('code');
                if (code) {
                    console.log("URL Code Param Detected")
                    proxy.loggedIn = true
                } else {
                    console.warn("URL Code Param NOT Detected")
                    proxy.loggedIn = false
                }
            }
        });
    }
};

window.addEventListener('resize', function(event) {
    let rightSide = document.getElementById("right-sidebar"); 
    let leftSide = document.getElementById("left-sidebar"); 

    if ((rightSide.offsetWidth <= 115 || leftSide.offsetWidth <= 115) && (rightSide.style.order != 5 || leftSide.style.order != 5)) {
        rightSide.style.order = 5;
        leftSide.style.order = 5;
        cardContainer.style.width = '100vw'; 
        leftSide.style.width = '45vw'; 
        rightSide.style.width = '45vw'; 
    } else {
        rightSide.style.order = 2;
        leftSide.style.order = 1;
        cardContainer.style.width = '50vw'; 
        leftSide.style.width = '20vw'; 
        rightSide.style.width = '20vw'; 
    }
}, true);



// API STUFF
async function generateCodeVerifierAndChallenge(len) {
    // Generate a random code verifier
    const codeVerifier = generateCodeVerifier(len); // You can adjust the length

    // Create a code challenge using "S256" method
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    const codeChallenge = base64UrlEncode(buffer);

    return {
        codeVerifier,
        codeChallenge
    };
    }

    function generateCodeVerifier(length) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
        let codeVerifier = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            codeVerifier += charset.charAt(randomIndex);
        }
        return codeVerifier;
    }

    function base64UrlEncode(buffer) {
    const bytes = new Uint8Array(buffer);
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateRandomString(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

  
const clientId = 'a517b42be802471ea6d45a616bb09845';
//const redirectUri = 'http://127.0.0.1:5500';
const redirectUri = 'https://card-ify.netlify.app/';
function loginSpotify() {
    generateCodeVerifierAndChallenge(128).then(({ codeVerifier, codeChallenge }) => {
        console.log('Code Verifier:', codeVerifier);
        console.log('Code Challenge:', codeChallenge);

        let state = generateRandomString(16);
        let scope = 'user-read-private playlist-read-private playlist-read-collaborative user-follow-read user-top-read user-library-read';

        localStorage.setItem('code_verifier', codeVerifier);

        let args = new URLSearchParams({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: state,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge
        });

        window.location = 'https://accounts.spotify.com/authorize?' + args;
    });
}

const urlParams = new URLSearchParams(window.location.search);
let code = urlParams.get('code');
console.log(code);
if (code) {
    let codeVerifier = localStorage.getItem('code_verifier');

    var body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier
    });
}

const response = fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body
})
.then(response => {
    if (!response.ok) {
        throw new Error('HTTP status ' + response.status);
    }
    return response.json();
})
.then(data => {
    localStorage.setItem('access_token', data.access_token);
    console.log("Request successful")
    proxy.loggedIn=true;
    let login = document.getElementById("login-button")
    login.style.display = "none"
    title.style.fontSize = "2em";
    tiltCard.parentNode.removeChild(tiltCard);
    cards.style.display = "flex";
    console.log('canvas drawing')
    drawCanvas(70)
    console.log('canvas drawn')
})
.catch(error => {
    getProfile().then((result) => {
        if (result) {
            console.log("Auth Code Valid")
            proxy.loggedIn = true
        } else {
            proxy.loggedIn = false
            let login = document.getElementById("login-button")
            login.style.display = "block"
            title.style.fontSize = "5em";
            parent.appendChild(tiltCard);
            cards.style.display = "none";
        }
    console.error('Error:', error);
    }); 
});


async function getProfile() {
    let accessToken = localStorage.getItem('access_token');
    
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
        Authorization: 'Bearer ' + accessToken
        }
    });
    
    const data = await response.json();
    if (!response.ok){
        return false
    } else{
        return true
    }
}

async function apiCalls() {
    let accessToken = localStorage.getItem('access_token');
    
    const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
        Authorization: 'Bearer ' + accessToken
        }
    });
    const profile_data = await response.json(); 

    const response2 = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
        Authorization: 'Bearer ' + accessToken
        }
    });
    const playlist_data = await response2.json(); 

    const response3 = await fetch('https://api.spotify.com/v1/me/top/tracks/?limit=50', {
        headers: {
        Authorization: 'Bearer ' + accessToken
        }
    });
    const track_data = await response3.json(); 

    const response4 = await fetch('https://api.spotify.com/v1/me/top/artists/?limit=50', {
        headers: {
        Authorization: 'Bearer ' + accessToken
        }
    });
    const artist_data = await response4.json(); 

    let popList = []; 
    artist_data.items.forEach((artist) => {
        popList.push(artist.popularity); 
    });

    let lenList = []; 
    track_data.items.forEach((track) => {
        lenList.push(track.duration_ms); 
        popList.push(track.popularity); 
    });
    const average = array => array.reduce((a, b) => a + b) / array.length;
    const avg_pop = average(popList);
    const avg_len = average(lenList);

    const real_data = {
                        display_name: profile_data.display_name, 
                        country: profile_data.country, 
                        followers: profile_data.followers.total, 
                        id: profile_data.id, 
                        picture: profile_data.images[1], 
                        product: profile_data.product, 
                        href: profile_data.href, 

                        playlist_count: playlist_data.total,

                        top_artist: artist_data.items[0].name, 
                        average_popularity: avg_pop,
                        average_track_length: avg_len
    };
    return real_data; 
}; 

function drawCanvas(spriteNum) {
    apiCalls().then((data) => {
        console.log(data)
        context.imageSmoothingEnabled = false;

        context.fillStyle = "#636363";
        context.font = "12px PokemonEmerald";
        context.fillText(`Name: ${data.display_name}`, 40, 96);
        context.fillStyle = "#d6d6ce";
        const id = Math.floor(1000 + Math.random() * 9000);
        context.fillText(`IDNo.0${id}`, 272, 49);
        context.fillStyle = "#636363";
        context.fillText(`IDNo.0${id}`, 270, 47);

        context.beginPath();
        context.moveTo(40, 103); 
        context.lineTo(250, 103); 
        context.stroke(); 

        if (data.product != 'free'){
            star = new Image(); 
            star.src = 'images/star.png'; 
            star.onload = function() {
                context.drawImage(star, 247, 100, 14, 14);
            };
        }
        context.fillText('PLAYLISTS', 40, 143); 
        context.fillText('FOLLOWERS', 40, 175); 
        context.fillText('POPULARITY', 40, 207); 

        context.textAlign = "end";
        context.fillText(data.playlist_count, 275, 143); 
        context.fillText(data.followers, 275, 175); 
        context.fillText(data.average_popularity + '%', 275, 207); 
        context.textAlign = "start";

        if (spriteNum>0){
            sprite = new Image(); 
            sprite.src = `images/sprites/images/trainer_${spriteNum}.png`; 
            sprite.onload = function() {
                context.drawImage(sprite, 297, 65, 130, 130);
                const cardImg = document.getElementById('cardImg'); 
                cardImg.src = cardCanvas.toDataURL(); 
                cardImg.classList.remove('loading'); 
                cardCanvas.style.display = 'none';
            };
        } else {
            const cardImg = document.getElementById('cardImg'); 
            console.log('drawn')
            cardImg.src = cardCanvas.toDataURL(); 
            cardImg.classList.remove('loading'); 
            cardCanvas.style.display = 'none';
        }

        
        return true; 
    });
}