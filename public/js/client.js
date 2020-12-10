const displayButton = document.getElementById( 'displayUrlsButton');
const scrapeButton = document.getElementById( 'scrapeGamesButton' );
const dropGamesButton = document.getElementById( 'drop-game-urls-button' );
const countUrlsButton = document.getElementById( 'count-urls-button');
const displayCalendarButton = document.getElementById( 'display-calendar-button' );
const countPitchesButton = document.getElementById( 'count-pitches-button' );
const submitScrapePitches = document.getElementById( 'submit-start-end-button' );


const urlContainer = document.getElementById( 'url-container' );
const urlCountContainer = document.getElementById( 'url-count-container' );
const pitchCountContainer = document.getElementById( 'pitch-count-container' );
const calendarImgContainer = document.getElementById( 'calendar-img-container' );


const svg = document.getElementById( 'Layer_1');
svg.style.display = 'none';

dropGamesButton.addEventListener( 'click', ( event ) => {
  fetch( '/delete-urls', { method : 'GET'} )
    .then( function( response ) {
      if( response.ok ) {
        console.log( 'collection dropped' );
      }
    } )
} )



scrapeButton.addEventListener( 'click', ( event ) => {
  let x = 0;
  svg.style.display = 'block';
  setInterval( ( ) => {

    svg.setAttribute( 'transform', `rotate(${x})`);
    x+=7;
   }, 50 );
  fetch('/scrape-games', {method: 'GET'} )
  .then(function(response) {

  

    if(response.ok) {
      return response.json();
      x = 0;
    }
    throw new Error('Request failed.');
  } )
  .then( ( data ) => {
    svg.style.display = 'none';
    while (urlCountContainer.firstChild) {
      urlCountContainer.removeChild(urlCountContainer.firstChild);
    } 
    const p = document.createElement( 'p' );
    p.innerHTML = 'Count : ' + data.count;
    urlCountContainer.appendChild( p );
  } )
  .catch(function(error) {
    console.log(error);
  } );
} )


displayButton.addEventListener( 'click', ( event ) => {
  fetch('/urls', {method: 'GET'} )
  .then(function(response) {
    if(response.ok) {
      return response.json();
    }
    throw new Error('Request failed.');
  } )
  .then( ( data ) => { 
    while (urlContainer.firstChild) {
      urlContainer.removeChild(urlContainer.firstChild);
  }
    const tr1 = document.createElement( 'tr' );
    const th1 = document.createElement( 'th' );
    const th2 = document.createElement( 'th' );
    const th3 = document.createElement( 'th' );

    urlContainer.appendChild( tr1 );
    tr1.appendChild( th1 );
    th1.innerHTML = 'index'
    tr1.appendChild( th2 );
    th2.innerHTML = 'id'
    tr1.appendChild( th3 );
    th3.innerHTML = 'url'
    if ( data.length === 0 ) {
      urlContainer.innerHTML = '<tr><td>No Records Found</td></tr>'
    }

    data.forEach( ( url, index ) => {


      const tr2 = document.createElement( 'tr' );
      const td1 = document.createElement( 'td' );
      const td2 = document.createElement( 'td' );
      const td3 = document.createElement( 'td' );
      td2.innerHTML = url._id;
      td3.innerHTML = url.url;
      td1.innerHTML = index;
      urlContainer.appendChild( tr2 );
      tr2.appendChild( td1 );
      tr2.appendChild( td2 );
      tr2.appendChild( td3 );
    } ) } )
  .catch(function(error) {
    console.log(error);
  } );
} )

countUrlsButton.addEventListener( 'click', ( event ) => { 
  fetch('/count-urls', {method: 'GET'} )
  .then(function(response) {
    if(response.ok) {
      // console.log( 200 ); 
      // console.log( response );
      return response.json();
    }
    throw new Error('Request failed.');
  } )
  .then( ( data ) => {
    while (urlCountContainer.firstChild) {
      urlCountContainer.removeChild(urlCountContainer.firstChild);
    }  
    const p = document.createElement( 'p' );
    p.innerHTML = 'Count : ' + data.count;
    urlCountContainer.appendChild( p );
  } )
  .catch(function(error) {
    console.log(error);
  } );

 } )

 displayCalendarButton.addEventListener( 'click', ( event ) => {
   fetch( '/calendar', { method : 'GET' } )
    .then( function( response ) {
      if( response.ok ) {
        return response.blob()
      }
      throw new Error( 'Request failed' );
    } )
    .then( ( data ) => {
      while (calendarImgContainer.firstChild) {
        calendarImgContainer.removeChild(calendarImgContainer.firstChild);
      }  
      let outside = URL.createObjectURL( data );
      let calendarImg = document.createElement( 'img' );
      calendarImg.addEventListener( 'click', ( event ) => {
        calendarImg.style.display = 'none';
      } )
      calendarImg.setAttribute( 'src', outside );
      calendarImg.setAttribute( 'height', '750px');
      calendarImg.setAttribute( 'width', '500px');

      calendarImgContainer.appendChild( calendarImg );
    } )
    .catch( ( error ) => {
      console.error( error );
    } )
 } )


 
submitScrapePitches.addEventListener( 'click', ( event ) => {
  const start = document.getElementById( 'start-game-index-input' ).value;
  const end = document.getElementById( 'end-game-index-input' ).value;
  console.log( 'start : ' , start );
  console.log( 'end : ', end );

  fetch('/scrape-pitches',
  {
    method: "POST",
    body: JSON.stringify( {start : start , end : end } ),
    headers: {
      "Content-Type": "application/json"
    }
  }
)
.then(function(response) {
  return response.json();
})
.then(function(myJson) {
  console.log(myJson);
});
} )


 countPitchesButton.addEventListener( 'click', ( event ) => { 
  fetch('/count-pitches', {method: 'GET'} )
  .then(function(response) {
    if(response.ok) {
      return response.json();
    }
    throw new Error('Request failed.');
  } )
  .then( ( data ) => {
    console.log( data );
    while (pitchCountContainer.firstChild) {
      pitchCountContainer.removeChild(pitchCountContainer.firstChild);
    }  
    const p = document.createElement( 'p' );
    p.innerHTML = 'Number of Pitches : ' + data.count;
    pitchCountContainer.appendChild( p );
  } )
  .catch(function(error) {
    console.log(error);
  } );

 } )






 


