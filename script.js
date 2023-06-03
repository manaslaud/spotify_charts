import {_clientId,_clientSecret} from './config.js'
const clientId = _clientId;
const clientSecret =_clientSecret;
// console.log(clientId)
const redirectUri = 'http://127.0.0.1:5500/index.html';
const scopes = ['user-read-private', 'user-library-read']; 
let accessToken=''
const btn = document.getElementById("btn-oauth");
const btn1=document.querySelector('.getSeachResults')
const btn2=document.getElementById('btn-savedAlbums')
let authorizationCode=''

function authorizeSpotify() {
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&response_type=code`;

  window.location.href = authUrl;
}

async function handleAuthorizationCode() {
  const urlParams = new URLSearchParams(window.location.search);
    authorizationCode = urlParams.get('code');
    // console.log(authorizationCode)

  if (authorizationCode) {
   await getAccessToken(authorizationCode);
   return accessToken;
  } else {
    console.error('Authorization code not found in URL');
  }
}

async function getAccessToken(authorizationCode) {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const body = new URLSearchParams();
  body.append('grant_type', 'authorization_code');
  body.append('code', authorizationCode);
  body.append('redirect_uri', redirectUri);

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
      },
    });

    if (response.ok) {
      const data = await response.json();
       accessToken = data.access_token;
       
     
    } else {
      throw new Error('Failed to retrieve access token');
    }
  } catch (error) {
    console.error('Error retrieving access token:', error);
    throw error;
  }
}

btn.addEventListener('click', authorizeSpotify);


const getSavedAlbums= async function(){
  // console.log(accessToken)
const response= await fetch('https://api.spotify.com/v1/me/albums?limit=20&offset=0', { method:'get',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
const data = await response.json()
renderSavedAlbums(data.items);
}
const renderSavedAlbums=async function(albumList){
  let ol=document.querySelector('ol')
  ol.className='OrderedList'
  // console.log(albumList)
  albumList.forEach(album=>{
    const li=document.createElement('li')
    li.className='Album'
    const artists=album.album.artists
    const images=album.album.images
    //getting each artists name

    artists.forEach((artist)=>{
      const title=document.createElement('h6')
      title.className='ArtistName'
      const artistName= artist.name
        title.innerHTML+=`${artistName}`
        li.append(title);
      }
    )

    const imageUrl=images[0].url;
    const ImageElement=document.createElement('img')
    ImageElement.src=imageUrl
    ImageElement.className='Image'
    li.append(ImageElement)
    ol.append(li)
    // console.log(images)
  })
}

const getSearchResults=async function(){
  const searchBar=document.querySelector('.searchBar');
  const searchQuery=searchBar.value;
  // console.log(searchQuery)
  const response= await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=artist&limit=8`, { method:'get',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})
const artistsArray=(await response.json()).artists.items;
renderSearchResults(artistsArray)
}
btn1.addEventListener('click',getSearchResults)


const renderSearchResults=function(artistsArray){
const ol=document.querySelector('.search-results')
if(ol.innerHTML==='')
{
artistsArray.forEach((artist)=>{
  const li= document.createElement('li');
const profileCard= document.createElement('div');
profileCard.className='profileCard'
li.className='li'
// if(artist.image.length==0){
// }
  let genreInnerHTML=``
    //creating genre
    artist.genres.forEach((genre)=>{
    genreInnerHTML+=`<span class="genre">${genre}, </span>`
  })
  //////////////////
  profileCard.innerHTML=`
<img src=${artist.images.length==0?'black-background-face-digital-art-colorful-wallpaper-preview.jpg':artist.images[0].url} class="artist-img">
<div class="artist-details">
<div class="artist-name">${artist.name}</div>
<div class="artist-popularity info">Popularity: ${artist.popularity}</div>
<div class="artist-genre info ">Genre: ${genreInnerHTML}</div>
<div class="artist-followers info">Popularity: ${artist.followers.total}</div>
</div>
`
li.appendChild(profileCard)
ol.appendChild(li)
})
}
else{
  ol.innerHTML=''
  renderSearchResults(artistsArray)
}
}



btn2.addEventListener('click',getSavedAlbums)
handleAuthorizationCode()




