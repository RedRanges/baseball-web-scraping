const Pitch = require( './pitch' );
const fs = require( 'fs' );
const Util = require ( './util' );

module.exports = class GamePage {
  constructor() {
    this.util = new Util();
    this.circleSelector = '#pitchChart > g > circle';
    this.pitchInfoSelector = '.evp-svg-tooltip';
    this.teamSelector = 'div > .team';
    this.pitches = [];
    this.homeTeam = '';
    this.awayTeam = '';
    this.gameDate = '';
  }

  clickHomeBatters = async( page ) => {
    await page.select('#type', 'home_batters');
    await page.screenshot( { 'path' : './public/images/game.png' } );
  }

  clickAwayBatters = async ( page ) => {
    await page.select('#type', 'away_batters');
    await page.screenshot( { 'path' : './public/images/game.png' } );
  }

  getHomeTeam = () => { 
    return this.homeTeam;
  }

  getAwayTeam = () => {
    return this.awayTeam;
  }

  setTeams = async ( page ) => { 
    const teams = await page.$$( this.teamSelector );
    const awayTeamText = await page.evaluate( team => team.innerText, teams[ 0 ] );
    const homeTeamText = await page.evaluate( team => team.innerText, teams[ 1 ] );
    const awayTeamTextArr = awayTeamText.split( ' ' );
    if ( awayTeamTextArr[ 1 ] === 'Sox' || awayTeamTextArr [ 1 ] == 'Jays') {
      this.awayTeam = awayTeamTextArr [ 0 ] + ' ' + awayTeamTextArr[ 1 ]  
    } else {
      this.awayTeam = awayTeamTextArr [ 0 ]
    }
    const homeTeamTextArr = homeTeamText.split( ' ' );
    if ( homeTeamTextArr[ 1 ] === 'Sox' || homeTeamTextArr [ 1 ] == 'Jays') {
      this.homeTeam = homeTeamTextArr [ 0 ] + ' ' + homeTeamTextArr[ 1 ]  
    } else {
      this.homeTeam = homeTeamTextArr [ 0 ]
    }
  }

  getPitches = async( page ) => {
    let circles = await page.$$( this.circleSelector );
    console.log( circles.length );
    let maxRetries = 10;
    for ( let i = 0; i < circles.length; i++ ){
      if ( maxRetries <= 0 ) {
        // TO DO : add batter for unknown pitches
        const pitch = new Pitch();
        pitch.date = this.gameDate;
        pitch.awayTeam = this.getAwayTeam();
        pitch.homeTeam = this.getHomeTeam();
        this.pitches.push( pitch );
        fs.appendFile( `./logs/${ this.util.getCurrentDay() }-unhoverable-pitch.txt`, `${ this.util.getCurrentTimeStamp() } : UNHOVERABLE PITCH ON: ${ pitch.date }\n` + 
                       `BETWEEN HOME TEAM : ${ pitch.homeTeam } and AWAY TEAM : ${ pitch.awayTeam } at PITCH INDEX : ${ i } \n`
                     + `PAGE : ${ page.url() }\n`, 
                          ( err ) => 
                          {
                            if ( err ) throw err 
                            console.log( 'unknown pitch : ', i ); 
                          } 
                      )
        console.log( 'Max Retries, moving to next pitch' );
        i+=1;
        maxRetries = 10;  
      }
    try {
      console.log( 'pitch index  :', i );
      let circle = circles [ i ];
      await circle.hover();
      const div = await page.$( this.pitchInfoSelector );
      const divText = await page.evaluate( div => div.innerText, div );
      const pitch = new Pitch( divText );
      pitch.awayTeam = this.getAwayTeam();
      pitch.homeTeam = this.getHomeTeam();
      pitch.date = this.gameDate;
      this.pitches.push( pitch );
      maxRetries = 10;
      await page.screenshot( {path: './public/images/hover.png'} );
      } catch ( err ) {
        // console.log( err );
        maxRetries -= 1; 
        console.log( 'can\'t find ptich, retry attempts left : ', maxRetries );
        i -=1;
      }
    }
  }
}