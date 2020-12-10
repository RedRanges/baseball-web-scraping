const puppeteer = require( 'puppeteer' );

module.exports = class GameLinksArray {
  constructor () {
    this.gameLinksSelector = 'div#ticker > div > div > div >div.flex > a';
    this.gameLinks = [];
  }

  pushGamesLinks = async ( page, day ) => {
    // for( let i = 0; i < 3; i ++ ) {
    // await this.delay( 5000 );
    const gamesLinksElements = await page.$$( this.gameLinksSelector );
    console.log( gamesLinksElements.length );
    for ( let gameLinkElement of gamesLinksElements ) {
      const gameLink = await page.evaluate( gameLinkElement => gameLinkElement.getAttribute( 'href' ), gameLinkElement );
      // console.log( gameLink[ gameLink.length -1 ] );
      // if ( gameLink[ gameLink.length - 1]  !== day ) {
      //   this.pushGamesLinks( page, day );
      // }
      console.log( gameLink );
      this.gameLinks.push( gameLink );
    }
  }
  // }

  delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
 }
}